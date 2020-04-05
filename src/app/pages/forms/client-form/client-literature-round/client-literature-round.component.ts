import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-literature-round',
  templateUrl: './client-literature-round.component.html',
  styleUrls: ['./client-literature-round.component.scss'],
})
export class ClientLiteratureRoundComponent implements OnInit {
  @Input() round: any = {};
  @Input() subround: any = {};
  constructor() {}

  async ngOnInit() {}
}
