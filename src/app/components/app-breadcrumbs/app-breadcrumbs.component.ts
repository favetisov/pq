import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { get as getVal, last } from 'lodash';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

interface BreadCrumb {
  label: string;
  url: string;
}

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './app-breadcrumbs.component.html',
  styleUrls: ['./app-breadcrumbs.component.scss'],
})
export class AppBreadcrumbsComponent implements OnInit {
  breadcrumbs: BreadCrumb[] = [];

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private titleService: Title,
    private translateService: TranslateService,
  ) {
    this.router.events
      .pipe(
        filter((event) => event instanceof NavigationEnd),
        distinctUntilChanged(),
      )
      .subscribe(async (event) => {
        this.breadcrumbs = this.buildBreadCrumb(this.activatedRoute.root);
        this.titleService.setTitle(
          await this.translateService.get(this.breadcrumbs[this.breadcrumbs.length - 1].label).toPromise(),
        );
      });
  }

  async ngOnInit() {}

  buildBreadCrumb(route: ActivatedRoute, url: string = '', breadcrumbs: BreadCrumb[] = []) {
    const bc = getVal(route, 'routeConfig.data.breadcrumbs', []).map((b) => {
      return route.snapshot.paramMap.keys.reduce(
        (bcms, key) => {
          return {
            label: bcms.label.replace(':' + key, route.snapshot.paramMap.get(key).replace(new RegExp('%2F', 'g'), '/')),
            link: bcms.link.replace(':' + key, route.snapshot.paramMap.get(key).replace(new RegExp('/', 'g'), '%2F')),
          };
        },
        { label: b.label, link: url + '/' + b.link },
      );
    });
    breadcrumbs.push(...bc);
    if (last(bc)) url += '/' + last(bc).link;
    if (route.firstChild) return this.buildBreadCrumb(route.firstChild, url, breadcrumbs);
    return breadcrumbs;
  }
}
