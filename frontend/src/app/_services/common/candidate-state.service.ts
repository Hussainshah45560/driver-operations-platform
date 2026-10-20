import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CandidateStateService {

    private candidateDataSubject = new BehaviorSubject<any>(null);
    candidateData$ = this.candidateDataSubject.asObservable();
    setcandidateData(data: any) {
        this.candidateDataSubject.next(data);
    }
}