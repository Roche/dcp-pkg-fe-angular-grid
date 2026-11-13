import {applicationConfig, Meta, moduleMetadata, StoryObj} from '@storybook/angular';
import {provideAnimations} from "@angular/platform-browser/animations";
import {TranslateModule} from "@ngx-translate/core";
import {FilterComponentService} from "../../../lib/services/filter-component.service";
import {NumericFilterComponent} from "../../../lib/grid/filters/numeric-filter.component";

const meta: Meta<NumericFilterComponent> = {
  title: 'Grid/Filters/Numeric Filter',
  component:  NumericFilterComponent,
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
type Story = StoryObj<NumericFilterComponent>;

export const NumericFilter: Story = {};
