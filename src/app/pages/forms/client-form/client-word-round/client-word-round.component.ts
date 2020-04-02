import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'client-word-round',
  templateUrl: './client-word-round.component.html',
  styleUrls: ['./client-word-round.component.scss'],
})
export class ClientWordRoundComponent implements OnInit {
  @Input() round: any = {};
  constructor() {}

  async ngOnInit() {}
}
