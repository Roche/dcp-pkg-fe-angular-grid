import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {provideAnimations} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {FilterComponentService} from "../../../lib/services/filter-component.service";
import {StringFilterComponent} from "../../../lib/grid/filters/string-filter.component";

const meta: Meta<StringFilterComponent> = {
  title: 'Grid/Filters/String Filter',
  component:  StringFilterComponent,
  decorators: [
    moduleMetadata({
      imports: [TranslateModule.forRoot({
        defaultLanguage: 'en'
      })],
      providers: [FilterComponentService],
    }),
    applicationConfig({
      providers: [provideAnimations()],
    }),
  ],
  tags: ['autodocs'],
  argTypes: {},
};

export default meta;
type Story = StoryObj<StringFilterComponent>;

export const StringFilter: Story = {};
