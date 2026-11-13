import { Injectable } from '@angular/core';

@Injectable()
export class FilterComponentService {
  private components = new Map<string, any>();
  private counter = 0;

  registerComponent(component: any): string {
    const id = `filter-${this.counter++}`;
    this.components.set(id, component);
    return id;
  }

  unregisterComponent(id: string) { this.components.delete(id); }

  getFilterDefinitions(): any[] {
    return [...this.components.values()].map(component => component.getFilterDefinition());
  }
}
