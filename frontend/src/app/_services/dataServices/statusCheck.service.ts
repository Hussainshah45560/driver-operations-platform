import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StatusCheckService {

    isStepValid(role: string, stepStatus: any, applicationStatus: string): boolean {
        let stepAllowed: any[] = [];
        let appAllowed: any[] = [];
        if (role == 'confirmer') {
            stepAllowed = ['completed'];
            appAllowed = ['completed', 'not confirmed'];
        }
        else if (role == 'approver') {
            stepAllowed = ['completed', 'confirmed', 'changed'];
            appAllowed = ['confirmed', 'rejected', 'in contract', 'changed', 'accepted','shortlisted','finalised'];
        }
        else if (role == 'editable') {
            stepAllowed = ['changed', 'not confirmed', 'rejected', 'completed', 'in progress', 'approved'];
            appAllowed = ['changed', 'not confirmed', 'rejected', 'in progress', 'accepted', 'confirmed', 'in contract', 'approved'];
            if (['completed'].includes(stepStatus) && ['not confirmed'].includes(applicationStatus)) {
                return false
            } else
                if (['confirm'].includes(stepStatus) && ['rejected'].includes(applicationStatus)) {
                    return false
                }
        }



        return stepAllowed.includes(stepStatus) && appAllowed.includes(applicationStatus);
    }

}