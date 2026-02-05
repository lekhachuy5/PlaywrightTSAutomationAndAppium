
import Imap from 'imap';
import { simpleParser } from 'mailparser';
import "dotenv/config";
import fs from "fs"

const config = {
    user: process.env.IMAP_EMAIL,
    password: process.env.IMAP_PASSWORD,
    host: process.env.IMAP_SERVER,
    port: Number(process.env.IMAP_PORT),
    tls: Boolean(process.env.IMAP_TLS)
};

async function getCurrentDateWithoutTime(): Promise<Date> {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);
    return yesterday;
}

export async function fetchEmails(subject: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        const imap = new Imap(config);
        let emailContent = '';

        imap.once('ready', () => {
            imap.openBox(process.env.IMAP_FOLDER || 'INBOX', false, async () => {
                imap.search(['UNSEEN'
                    , ['FROM', process.env.IMAP_FROM_EMAIL]
                    , ['SINCE', await getCurrentDateWithoutTime()]
                    , ['SUBJECT', subject]
                ], (err, results) => {
                    if (err) {
                        console.error('IMAP search error:', err);
                        imap.end();
                        reject(err);
                        return;
                    }

                    if (results.length === 0) {
                        console.log('No unread emails found.');
                        imap.end();
                        resolve(emailContent);
                        return;
                    }

                    const f = imap.fetch(results, { bodies: '' });
                    let processedFirstEmail = false;

                    f.on('message', (msg) => {
                        if (processedFirstEmail) {
                            return;
                        }

                        msg.on('body', (stream) => {
                            simpleParser(stream, async (err, parsed) => {
                                if (err) {
                                    console.error('Error parsing email:', err);
                                    return;
                                }

                                const textWithoutMime = await removeMimeHeaders(parsed.text || '');
                                const subject = parsed.subject || 'No Subject';
                                emailContent = subject + "\n" + textWithoutMime;
                                processedFirstEmail = true;
                                imap.end(); 
                                resolve(emailContent); 
                            });
                        });
                    });

                    f.once('error', (ex) => {
                        console.error('Fetch error:', ex);
                        imap.end();
                        reject(ex); 
                    });
                });
            });
        });

        imap.once('error', (err: unknown) => {
            console.error('IMAP connection error:', err);
            reject(err);
        });

        imap.once('end', () => {
            console.log('IMAP connection ended.');
        });

        imap.connect();
    });
}

// Function to remove MIME headers and boundaries
async function removeMimeHeaders(content: string): Promise<string> {
    // Regular expression to match and remove MIME headers and boundaries
    const mimeRegex = /Content-Type:[\s\S]*?(?=Content-Type:|\n\n|\r\n\r\n)/g;
    return content.replace(mimeRegex, '');
}

export async function getEmailTemplates(templateName: string) {
    const templateContent = fs.readFileSync(`src/email-content-templates/${templateName}.txt`, 'utf-8');
    return templateContent;
}

module.exports = { fetchEmails, getEmailTemplates };