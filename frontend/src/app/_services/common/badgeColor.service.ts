import { Injectable } from '@angular/core';
@Injectable({
    providedIn: 'root',
})
export class BadgeColorService {
    constructor() { }

    getBadgeColor(status: string) {
        switch (status) {
            case 'allocated':
            case 'finalised':
            case 'uploaded':
            case 'signed':
            case 'passed':
            case 'complete':
            case 'approved':
            case 'accepted':
                return {
                    background: '#D1FADF',
                    border: '1px solid #4CBD75',
                    color: '#00522A'
                };
            case 'confirmed':
                return {
                    background: 'rgb(208, 228, 255)',
                    border: '1px solid #94ADCD',
                    color: '#174974'
                };
            case 'completed':
                return {
                    background: '#EAF1FF',
                    border: '1px solid #94ADCD',
                    color: '#174974'
                };

            case 'rejected':
            case 'terminated':
            case 'fail':
            case 'failed':
            case 'not returned':
            case 'not confirmed':
                return {
                    background: '#FFEDEA',
                    border: '1px solid #FF897D',
                    color: '#93000A'
                };

            case 'in progress':
                return {
                    background: 'rgb(208, 228, 255)',
                    border: '1px solid rgb(23, 73, 116)',
                    color: 'rgb(23, 73, 116)'
                };
            case 'generated':
            case 'canceled':
            case 'not started':
            case 'not allocated':
                return {
                    background: '#F1F0F3',
                    border: '#ABABAE',
                    color: '#464749'
                };
            default:
                return {
                    background: 'rgb(208, 228, 255)',
                    border: '1px solid rgb(23, 73, 116)',
                    color: 'rgb(23, 73, 116)'
                };
        }
    }

}
