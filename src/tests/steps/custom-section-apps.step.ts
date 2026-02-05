
import { binding, then, when as and } from 'cucumber-tsflow';
import CustomSection from '../../hooks/pages/custom-app-sections';

@binding()
class CustomSectionSteps {
    customSection: CustomSection

    constructor() {
        this.customSection = new CustomSection()

    }

    @and('User opens setting pages')
    public async openSettingPage() {
        await this.customSection.openSettingPages()
    }
    @and('User opens custom app section')
    public async openCustomSectionPage() {
        await this.customSection.openCustomAppPage()
    }

    @then('User verifies global section')
    public async verifyGlobalSection() {
        await this.customSection.verifyGlobalPage()
    }

    @then('User edits global section')
    public async editGlobalSection() {
        await this.customSection.editGlobalPage()
    }

    @and('User opens sub section')
    public async openSubSection() {
        await this.customSection.openSubSections()
    }

    @then('User verifies sub section list')
    public async verifySubSectionList() {
        await this.customSection.verifySubSectionList()
    }

    @then('User edits sub section')
    public async editSubSection() {
        await this.customSection.editSubSection()
    }

    @then('User deletes sub section')
    public async deleteSubSection() {
        await this.customSection.deleteSubSection()
    }

    @then('User creates new sub section')
    public async createNewSubSection() {
        await this.customSection.createNewSubSection()
    }
}

export default CustomSectionSteps;
