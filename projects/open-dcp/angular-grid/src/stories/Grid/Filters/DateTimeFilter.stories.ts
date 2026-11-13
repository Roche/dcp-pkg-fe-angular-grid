import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {provideAnimations} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {FilterComponentService} from "../../../lib/services/filter-component.service";
import {DateTimeFilterComponent} from "../../../lib/grid/filters/date-time-filter.component";

const meta: Meta<DateTimeFilterComponent> = {
  title: 'Grid/Filters/DateTime Filter',
  component:  DateTimeFilterComponent,
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
type Story = StoryObj<DateTimeFilterComponent>;

export const DateTimeFilter: Story = {};
