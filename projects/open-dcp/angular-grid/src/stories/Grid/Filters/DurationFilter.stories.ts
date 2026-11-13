import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {provideAnimations} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {FilterComponentService} from "../../../lib/services/filter-component.service";
import {DurationFilterComponent} from "../../../lib/grid/filters/duration-filter.component";

const meta: Meta<DurationFilterComponent> = {
  title: 'Grid/Filters/Duration Filter',
  component:  DurationFilterComponent,
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
type Story = StoryObj<DurationFilterComponent>;

export const DurationFilter: Story = {};
