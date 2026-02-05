
import { binding, then, when as and } from 'cucumber-tsflow';
import Documents from '../../hooks/pages/documents';

@binding()
class DocumentsSteps {
    documents: Documents

    constructor() {
        this.documents = new Documents()

    }

    @and('User opens documents page')
    public async openDocumentsPage() {
        await this.documents.openDocumentsPage()
    }

    @then('User verifies document list')
    public async verifyDocumentList() {
        await this.documents.verifyDocumentList()
    }

    @then('User creates new document')
    public async createNewDocument() {
        await this.documents.createNewDocument()
    }

    @then('User edits document')
    public async editDocument() {
        await this.documents.editDocument()
    }

    @then('User deletes document')
    public async deleteDocument() {
        await this.documents.deleteDocument()
    }
}

export default DocumentsSteps;
