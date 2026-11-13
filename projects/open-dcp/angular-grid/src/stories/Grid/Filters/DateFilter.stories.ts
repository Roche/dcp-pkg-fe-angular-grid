import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {DateFilterComponent} from "../../../lib/grid/filters/date-filter.component";
import {provideAnimations} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {FilterComponentService} from "../../../lib/services/filter-component.service";

const meta: Meta<DateFilterComponent> = {
  title: 'Grid/Filters/DateFilter',
  component: DateFilterComponent,
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
type Story = StoryObj<DateFilterComponent>;

export const DateFilter: Story = {};
