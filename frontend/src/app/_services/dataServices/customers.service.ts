import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Contact, Customer } from '../../core/modals';
import { Pagination } from '../../core/modals/pagination';
import { Params } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class CustomersService {
  constructor(private http: HttpClient) { }

  getAllCustomers(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Customer[] }>(
        environment.api + 'customers',
        { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  
  getCustomerData(id: string, step: string) {
    return this.http
      .get<{ success: boolean; data: Customer }>(
        environment.api + 'customers/getCustomerStep' + step + '/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  getCustomerInfo(id: string) {
    return this.http
      .get<{ success: boolean; data: Customer }>(
        environment.api + 'customers/getCustomerInfo/' + id
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateCustomer(data: Customer, step: string, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'customers/saveCustomer' + step + '/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: Customer }>(
          environment.api + 'customers/saveCustomer' + step,
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  updateCustomerStatus(id: string) {
    return this.http
      .put(
        environment.api + 'customers/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }

  deleteCustomer(id: string) {
    return this.http.delete(environment.api + 'customers/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }
  getAllContacts(params: Params) {
    return this.http
      .get<{ success: boolean; pagination: Pagination; data: Contact[] }>(
        environment.api + 'customers/customer-contacts', { params: params }
      )
      .pipe(
        map((res) => {
          return res;
        })
      );
  }
  getSingleContact(id: string) {
    return this.http
      .get<{ success: boolean; data: Contact }>(environment.api + 'customers/customer-contacts/' + id)
      .pipe(
        map((res) => {
          return res;
        })
      );
  }

  createOrUpdateContact(data: Contact, id?: string) {
    if (id != '' && id != undefined) {
      return this.http.put(environment.api + 'customers/customer-contacts/' + id, data).pipe(
        map((res) => {
          return res;
        })
      );
    } else {
      return this.http
        .post<{ success: boolean; data: any }>(
          environment.api + 'customers/customer-contacts/',
          data
        )
        .pipe(
          map((res) => {
            return res;
          })
        );
    }
  }

  deleteContact(id: string) {
    return this.http.delete(environment.api + 'customers/customer-contacts/' + id).pipe(
      map((res) => {
        return res;
      })
    );
  }

  updateContactStatus(id: string) {
    return this.http
      .put(
        environment.api + 'customers/customer-contacts/changeStatus/' + id,
        {}
      )
      .pipe(map((res) => res));
  }
}
