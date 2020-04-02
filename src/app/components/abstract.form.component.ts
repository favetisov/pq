import { ViewChildren, QueryList, Directive } from '@angular/core';
import { AdmElementContainerComponent } from 'app/components/adm-element-container/adm-element-container.component';

@Directive()
export abstract class AbstractFormComponent {
  @ViewChildren(AdmElementContainerComponent) elements: QueryList<AdmElementContainerComponent>;

  async isValid(): Promise<boolean> {
    const validationResults = await Promise.all(this.elements.map((e) => e.validate()));
    return validationResults.filter(Boolean).length === 0;
  }
}
