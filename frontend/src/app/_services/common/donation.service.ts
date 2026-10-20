import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Campaign, CampaignMembers, CampaignProduct, Donation, Product } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';



@Injectable({
  providedIn: 'root',
})
export class DonationService {
  constructor(private http: HttpClient) { }

  getCampaignDetails(campaignId: string, studentId: string) {
    return this.http.get<{ success: boolean, data: Donation }>(environment.api + 'donations/' + campaignId + '/' + studentId).pipe(map((res) => {
      return res;
    })
    );
  }

}
