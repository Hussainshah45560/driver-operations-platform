import { Routes } from '@angular/router';
import { LoginComponent } from './publicPages/auth/login/login.component';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { DashboardComponent } from './privatePages/dashboard/dashboard.component';
import { AuthGuard } from './core/guards/auth.guard';
import { LoggedOffGuard } from './core/guards/logged-off.guard';
import { SignUpComponent } from './publicPages/auth/sign-up/sign-up.component';
import { RolesComponent } from './privatePages/admin/roles/roles.component';
import { AccountsComponent } from './publicPages/auth/accounts/accounts.component';
import { HomeComponent } from './privatePages/driver/home/home.component';
import { ForgetPasswordComponent } from './publicPages/auth/forget-password/forget-password.component';
import { ConfirmOtpComponent } from './publicPages/auth/confirm-otp/confirm-otp.component';
import { NewPasswordComponent } from './publicPages/auth/new-password/new-password.component';
import { SuccessComponent } from './publicPages/auth/success/success.component';
import { ApplicationsComponent } from './privatePages/admin/applications/applications.component';
import { NewComponent } from './privatePages/admin/applications/new/new.component';
import { Step1Component } from './privatePages/admin/applications/new/step1/step1.component';
import { Step2Component } from './privatePages/admin/applications/new/step2/step2.component';
import { Step3Component } from './privatePages/admin/applications/new/step3/step3.component';
import { Step9Component } from './privatePages/admin/applications/new/step9/step9.component';
import { Step8Component } from './privatePages/admin/applications/new/step8/step8.component';
import { Step7Component } from './privatePages/admin/applications/new/step7/step7.component';
import { Step6Component } from './privatePages/admin/applications/new/step6/step6.component';
import { Step5Component } from './privatePages/admin/applications/new/step5/step5.component';
import { Step4Component } from './privatePages/admin/applications/new/step4/step4.component';
import { UsersComponent } from './privatePages/admin/users/users.component';
import { NewUserComponent } from './privatePages/admin/users/new-user/new-user.component';
import { EmailsComponent } from './privatePages/admin/emails/emails.component';
import { TemplatesComponent } from './privatePages/admin/templates/templates.component';
import { PermissionsComponent } from './privatePages/admin/roles/permissions/permissions.component';
import { NewEmailComponent } from './privatePages/admin/emails/new-email/new-email.component';
import { NewTemplateComponent } from './privatePages/admin/templates/new-template/new-template.component';
import { SettingsComponent } from './privatePages/admin/settings/settings.component';
import { AreasComponent } from './privatePages/admin/settings/areas/areas.component';
import { BenefitsComponent } from './privatePages/admin/settings/benefits/benefits.component';
import { RegionsComponent } from './privatePages/admin/settings/regions/regions.component';
import { AccessoriesComponent } from './privatePages/admin/settings/accessories/accessories.component';
import { DocumentTypeComponent } from './privatePages/admin/settings/document-type/document-type.component';
import { LanguagesComponent } from './privatePages/admin/settings/languages/languages.component';
import { LicenseCodesComponent } from './privatePages/admin/settings/license-codes/license-codes.component';
import { NationalityComponent } from './privatePages/admin/settings/nationality/nationality.component';
import { SkillsComponent } from './privatePages/admin/settings/skills/skills.component';
import { SubDevicesComponent } from './privatePages/admin/settings/sub-devices/sub-devices.component';
import { VehicleTypeComponent } from './privatePages/admin/settings/vehicle-type/vehicle-type.component';
import { CalendarsComponent } from './privatePages/admin/calendars/calendars.component';
import { CustomersComponent } from './privatePages/admin/customers/customers.component';
import { NewCustomerComponent } from './privatePages/admin/customers/new-customer/new-customer.component';
import { DetailsComponent } from './privatePages/admin/customers/new-customer/details/details.component';
import { AddressComponent } from './privatePages/admin/customers/new-customer/address/address.component';
import { ContactsComponent } from './privatePages/admin/customers/new-customer/contacts/contacts.component';
import { ConfigurationComponent } from './privatePages/admin/customers/new-customer/configuration/configuration.component';
import { ChecklistsComponent } from './privatePages/admin/checklists/checklists.component';
import { NewChecklistComponent } from './privatePages/admin/checklists/new-checklist/new-checklist.component';
import { ContentComponent } from './privatePages/admin/content/content.component';
import { NewContentComponent } from './privatePages/admin/content/new-content/new-content.component';
import { AccountTypeComponent } from './privatePages/admin/settings/account-type/account-type.component';
import { ChecklistTypeComponent } from './privatePages/admin/settings/checklist-type/checklist-type.component';
import { RelationTypeComponent } from './privatePages/admin/settings/relation-type/relation-type.component';
import { AodComponent } from './privatePages/admin/aod/aod.component';
import { NewAodComponent } from './privatePages/admin/aod/new-aod/new-aod.component';
import { AodReasonsComponent } from './privatePages/admin/settings/aod-reasons/aod-reasons.component';
import { AodTypesComponent } from './privatePages/admin/settings/aod-types/aod-types.component';
import { PaymentTermsComponent } from './privatePages/admin/settings/payment-terms/payment-terms.component';
import { RecruitmentTypesComponent } from './privatePages/admin/settings/recruitment-types/recruitment-types.component';
import { RecruitmentStatusComponent } from './privatePages/admin/settings/recruitment-status/recruitment-status.component';
import { RecruitmentModelsComponent } from './privatePages/admin/settings/recruitment-models/recruitment-models.component';
import { EquipmentsComponent } from './privatePages/admin/settings/equipments/equipments.component';
import { CostCentersComponent } from './privatePages/admin/settings/cost-centers/cost-centers.component';
import { ProfileComponent } from './privatePages/profile/profile.component';
import { RecruitmentsComponent } from './privatePages/admin/recruitments/recruitments.component';
import { NewRecruitmentComponent } from './privatePages/admin/recruitments/new-recruitment/new-recruitment.component';
import { MatchingCandidatesComponent } from './privatePages/admin/recruitments/matching-candidates/matching-candidates.component';
import { InductionComponent } from './privatePages/admin/induction/induction.component';
import { NewInductionComponent } from './privatePages/admin/induction/new-induction/new-induction.component';
import { CandidateDetailsComponent } from './privatePages/admin/induction/new-induction/candidate-details/candidate-details.component';
import { CheckListComponent } from './privatePages/admin/induction/new-induction/check-list/check-list.component';
import { VehicleTestingComponent } from './privatePages/admin/induction/new-induction/vehicle-testing/vehicle-testing.component';
import { ContractComponent } from './privatePages/admin/induction/new-induction/contract/contract.component';
import { DriverTestingComponent } from './privatePages/admin/induction/new-induction/driver-testing/driver-testing.component';
import { DisciplinaryComponent } from './privatePages/admin/disciplinary/disciplinary.component';
import { NewDisciplinaryComponent } from './privatePages/admin/disciplinary/new-disciplinary/new-disciplinary.component';
import { LogRequestComponent } from './privatePages/admin/disciplinary/new-disciplinary/log-request/log-request.component';
import { SignsComponent } from './privatePages/admin/disciplinary/new-disciplinary/sign/sign.component';
import { HearingComponent } from './privatePages/admin/disciplinary/new-disciplinary/hearing/hearing.component';
import { DisputeComponent } from './privatePages/admin/disciplinary/new-disciplinary/dispute/dispute.component';
import { DisciplinaryAodComponent } from './privatePages/admin/disciplinary/new-disciplinary/disciplinary-aod/disciplinary-aod.component';
import { OffboardingComponent } from './privatePages/admin/offboarding/offboarding.component';
import { NewOffboardingComponent } from './privatePages/admin/offboarding/new-offboarding/new-offboarding.component';
import { QueriesComponent } from './privatePages/admin/queries/queries.component';
import { NewQueriesComponent } from './privatePages/admin/queries/new-queries/new-queries.component';
import { BankingDetailsComponent } from './privatePages/driver/banking-details/banking-details.component';
import { AssetsComponent } from './privatePages/driver/assets/assets.component';
import { NewAssetComponent } from './privatePages/driver/assets/new-asset/new-asset.component';
import { VehicleInspectionComponent } from './privatePages/driver/vehicle-inspection/vehicle-inspection.component';
import { NewVehicleInspectionComponent } from './privatePages/driver/vehicle-inspection/new-vehicle-inspection/new-vehicle-inspection.component';
import { IncidentsComponent } from './privatePages/driver/incidents/incidents.component';
import { NewIncidentComponent } from './privatePages/driver/incidents/new-incident/new-incident.component';
import { RemittanceComponent } from './privatePages/driver/remittance/remittance.component';
import { BankComponent } from './privatePages/admin/settings/bank/bank.component';
import { PayslipsComponent } from './privatePages/driver/payslips/payslips.component';
import { Irp5sComponent } from './privatePages/driver/irp5s/irp5s.component';
import { DocumentsComponent } from './privatePages/driver/documents/documents.component';
import { NoticesComponent } from './privatePages/driver/notices/notices.component';
import { EqupimentsComponent } from './privatePages/driver/equpiments/equpiments.component';
import { ContractsComponent } from './privatePages/driver/contracts/contracts.component';
import { TestsComponent } from './privatePages/driver/tests/tests.component';
import { BookTestComponent } from './privatePages/driver/tests/book-test/book-test.component';
import { MyJobComponent } from './privatePages/driver/my-job/my-job.component';
import { SignNoticeComponent } from './privatePages/driver/notices/sign-notice/sign-notice.component';
import { SignTemplateComponent } from './privatePages/admin/aod/sign-template/sign-template.component';
import { DriverQueriesComponent } from './privatePages/admin/queries/driver-queries/driver-queries.component';
import { SignContractComponent } from './privatePages/driver/contracts/sign-contract/sign-contract.component';
import { ClearanceTypeComponent } from './privatePages/admin/settings/clearance-type/clearance-type.component';
import { DisciplinaryTypeComponent } from './privatePages/admin/settings/disciplinary-type/disciplinary-type.component';
import { WarningReasonComponent } from './privatePages/admin/settings/warning-reason/warning-reason.component';
import { DisputeTypeComponent } from './privatePages/admin/settings/dispute-type/dispute-type.component';
import { TestTypeComponent } from './privatePages/admin/settings/test-type/test-type.component';
import { SetPasswordComponent } from './publicPages/auth/set-password/set-password.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '',
    pathMatch: 'full',
  },
  {
    path: '',
    component: AccountsComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'signup',
    component: SignUpComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'forgot-password',
    component: ForgetPasswordComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'confirm-otp',
    component: ConfirmOtpComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'new-password',
    component: NewPasswordComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'set-password',
    component: SetPasswordComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: 'success',
    component: SuccessComponent,
    canActivate: [LoggedOffGuard],
  },
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        canActivate: [AuthGuard],
        data: { component: 'dashboard', permission: 'view' },
      },
      {
        path: 'home',
        component: HomeComponent,
        canActivate: [AuthGuard],
        data: { component: 'home', permission: 'view' },
      },
      {
        path: 'myJob',
        component: MyJobComponent,
        canActivate: [AuthGuard],
        data: { component: 'job', permission: 'view' },
      },
      {
        path: 'bankingDetails',
        component: BankingDetailsComponent,
        canActivate: [AuthGuard],
        data: { component: 'bankingDetails', permission: 'view' },
      },
      {
        path: 'assets',
        component: AssetsComponent,
        canActivate: [AuthGuard],
        data: { component: 'assets', permission: 'view' },
      },
      {
        path: 'assets/view/:id',
        component: NewAssetComponent,
        canActivate: [AuthGuard],
        data: { component: 'assets', permission: 'view' },
      },
      {
        path: 'assets/edit/:id',
        component: NewAssetComponent,
        canActivate: [AuthGuard],
        data: { component: 'assets', permission: 'update' },
      },
      {
        path: 'assets/new',
        component: NewAssetComponent,
        canActivate: [AuthGuard],
        data: { component: 'assets', permission: 'view' },
      },
      {
        path: 'remittance',
        component: RemittanceComponent,
        canActivate: [AuthGuard],
        data: { component: 'remittance', permission: 'view' },
      },
      {
        path: 'payslips',
        component: PayslipsComponent,
        canActivate: [AuthGuard],
        data: { component: 'paySlips', permission: 'view' },
      },
      {
        path: 'irp5s',
        component: Irp5sComponent,
        canActivate: [AuthGuard],
        data: { component: 'irp5s', permission: 'view' },
      },
      {
        path: 'notices',
        component: NoticesComponent,
        canActivate: [AuthGuard],
        data: { component: 'notices', permission: 'view' },
      },
      {
        path: 'notices/sign/:id',
        component: SignNoticeComponent,
        canActivate: [AuthGuard],
        data: { component: 'notices', permission: 'view' },
      },
      {
        path: 'equipment',
        component: EqupimentsComponent,
        canActivate: [AuthGuard],
        data: { component: 'equipment', permission: 'view' },
      },
      {
        path: 'documents',
        component: DocumentsComponent,
        canActivate: [AuthGuard],
        data: { component: 'documents', permission: 'view' },
      },
      {
        path: 'contracts',
        component: ContractsComponent,
        canActivate: [AuthGuard],
        data: { component: 'contracts', permission: 'view' },
      },
      {
        path: 'contracts/sign/:id',
        component: SignContractComponent,
        canActivate: [AuthGuard],
        data: { component: 'contracts', permission: 'view' },
      },
      {
        path: 'tests',
        component: TestsComponent,
        canActivate: [AuthGuard],
        data: { component: 'tests', permission: 'view' },
      },
      {
        path: 'tests/view/:id',
        component: BookTestComponent,
        canActivate: [AuthGuard],
        data: { component: 'tests', permission: 'view' },
      },
      {
        path: 'tests/edit/:id',
        component: BookTestComponent,
        canActivate: [AuthGuard],
        data: { component: 'tests', permission: 'view' },
      },
      {
        path: 'tests/new',
        component: BookTestComponent,
        canActivate: [AuthGuard],
        data: { component: 'tests', permission: 'view' },
      },
      {
        path: 'inspection',
        component: VehicleInspectionComponent,
        canActivate: [AuthGuard],
        data: { component: 'inspection', permission: 'view' },
      },
      {
        path: 'inspection/view/:id',
        component: NewVehicleInspectionComponent,
        canActivate: [AuthGuard],
        data: { component: 'inspection', permission: 'view' },
      },
      {
        path: 'incidents',
        component: IncidentsComponent,
        canActivate: [AuthGuard],
        data: { component: 'incidents', permission: 'view' },
      },
      {
        path: 'incidents/view/:id',
        component: NewIncidentComponent,
        canActivate: [AuthGuard],
        data: { component: 'incidents', permission: 'view' },
      },
      {
        path: 'incidents/new',
        component: NewIncidentComponent,
        canActivate: [AuthGuard],
        data: { component: 'incidents', permission: 'view' },
      },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [AuthGuard],
        data: { component: 'profile', permission: 'view' },
      },
      {
        path: 'induction',
        component: InductionComponent,
        canActivate: [AuthGuard],
        data: { component: 'induction', permission: 'view' },
      },
      {
        path: 'induction/:applicationId',
        component: NewInductionComponent,
        canActivate: [AuthGuard],
        data: { component: 'induction', permission: 'view' },
        children: [
          {
            path: '',
            redirectTo: 'candidate-details',
            pathMatch: 'full',
          },
          {
            path: 'candidate-details',
            component: CandidateDetailsComponent,
            canActivate: [AuthGuard],
            data: { component: 'induction', permission: 'view' },
          },
          {
            path: 'checklist',
            component: CheckListComponent,
            canActivate: [AuthGuard],
            data: { component: 'induction', permission: 'view' },
          },
          {
            path: 'vehicle-testing',
            component: VehicleTestingComponent,
            canActivate: [AuthGuard],
            data: { component: 'induction', permission: 'view' },
          },
          {
            path: 'driver-testing',
            component: DriverTestingComponent,
            canActivate: [AuthGuard],
            data: { component: 'induction', permission: 'view' },
          },
          {
            path: 'contract',
            component: ContractComponent,
            canActivate: [AuthGuard],
            data: { component: 'induction', permission: 'view' },
          },
        ],
      },
      {
        path: 'disciplinary',
        component: DisciplinaryComponent,
        canActivate: [AuthGuard],
        data: { component: 'disciplinary', permission: 'view' },
      },
      {
        path: 'disciplinary/new',
        component: NewDisciplinaryComponent,
        canActivate: [AuthGuard],
        data: { component: 'disciplinary', permission: 'view' },
        children: [
          {
            path: '',
            redirectTo: 'log-request',
            pathMatch: 'full',
          },
          {
            path: 'log-request',
            component: LogRequestComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
        ],
      },
      {
        path: 'disciplinary/:disciplinaryId',
        component: NewDisciplinaryComponent,
        canActivate: [AuthGuard],
        data: { component: 'disciplinary', permission: 'view' },
        children: [
          {
            path: '',
            redirectTo: 'log-request',
            pathMatch: 'full',
          },
          {
            path: 'log-request',
            component: LogRequestComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
          {
            path: 'sign',
            component: SignsComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
          {
            path: 'hearing',
            component: HearingComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
          {
            path: 'dispute',
            component: DisputeComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
          {
            path: 'aod',
            component: DisciplinaryAodComponent,
            canActivate: [AuthGuard],
            data: { component: 'disciplinary', permission: 'view' },
          },
        ],
      },
      {
        path: 'offBoarding',
        component: OffboardingComponent,
        canActivate: [AuthGuard],
        data: { component: 'offBoarding', permission: 'view' },
      },
      {
        path: 'offBoarding/new',
        component: NewOffboardingComponent,
        canActivate: [AuthGuard],
        data: { component: 'offBoarding', permission: 'view' },
      },
      {
        path: 'offBoarding/edit/:offBoardingId',
        component: NewOffboardingComponent,
        canActivate: [AuthGuard],
        data: { component: 'offBoarding', permission: 'view' },
      },
      {
        path: 'offBoarding/view/:offBoardingId',
        component: NewOffboardingComponent,
        canActivate: [AuthGuard],
        data: { component: 'offBoarding', permission: 'view' },
      },
      {
        path: 'queries',
        component: QueriesComponent,
        canActivate: [AuthGuard],
        data: { component: 'queries', permission: 'view' },
      },
      {
        path: 'queries/new',
        component: DriverQueriesComponent,
        canActivate: [AuthGuard],
        data: { component: 'queries', permission: 'view' },
      },
      {
        path: 'queries/:queryId',
        component: NewQueriesComponent,
        canActivate: [AuthGuard],
        data: { component: 'queries', permission: 'view' },
      },
      {
        path: 'recruitment',
        component: RecruitmentsComponent,
        canActivate: [AuthGuard],
        data: { component: 'recruitment', permission: 'view' },
      },
      {
        path: 'recruitment/new',
        component: NewRecruitmentComponent,
        canActivate: [AuthGuard],
        data: { component: 'recruitment', permission: 'add' },
      },
      {
        path: 'recruitment/edit/:id',
        component: NewRecruitmentComponent,
        canActivate: [AuthGuard],
        data: { component: 'recruitment', permission: 'update' },
      },
      {
        path: 'recruitment/candidates/:id',
        component: MatchingCandidatesComponent,
        canActivate: [AuthGuard],
        data: { component: 'recruitment', permission: 'update' },
      },
      {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard],
        data: { component: 'settings', permission: 'view' },
        children: [
          {
            path: '',
            redirectTo: 'accessories',
            pathMatch: 'full',
          },
          {
            path: 'accessories',
            component: AccessoriesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'aodReasons',
            component: AodReasonsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'aodTypes',
            component: AodTypesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'banks',
            component: BankComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'paymentTerms',
            component: PaymentTermsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'recruitmentTypes',
            component: RecruitmentTypesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'recruitmentStatuses',
            component: RecruitmentStatusComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'equipments',
            component: EquipmentsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'costCenters',
            component: CostCentersComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'recruitmentModels',
            component: RecruitmentModelsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'regions',
            component: RegionsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'areas',
            component: AreasComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'documentTypes',
            component: DocumentTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'languages',
            component: LanguagesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'licenseCodes',
            component: LicenseCodesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'nationalities',
            component: NationalityComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'skills',
            component: SkillsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'subDevices',
            component: SubDevicesComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'vehicleTypes',
            component: VehicleTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'benefits',
            component: BenefitsComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'accountTypes',
            component: AccountTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'relationTypes',
            component: RelationTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'checklistTypes',
            component: ChecklistTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'clearanceTypes',
            component: ClearanceTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'disciplinaryTypes',
            component: DisciplinaryTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'disputeTypes',
            component: DisputeTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'testTypes',
            component: TestTypeComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
          {
            path: 'warningReasons',
            component: WarningReasonComponent,
            canActivate: [AuthGuard],
            data: { component: 'settings', permission: 'view' },
          },
        ],
      },
      {
        path: 'applications',
        component: ApplicationsComponent,
        canActivate: [AuthGuard],
        data: { component: 'applications', permission: 'view' },
        children: [],
      },
      {
        path: 'applications/new',
        component: NewComponent,
        canActivate: [AuthGuard],
        data: { component: 'applications', permission: 'add' },
        children: [
          {
            path: '',
            redirectTo: 'step1',
            pathMatch: 'full',
          },
          {
            path: 'step1',
            component: Step1Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'add' },
          },
        ],
      },
      {
        path: 'applications/edit/:id',
        component: NewComponent,
        canActivate: [AuthGuard],
        data: { component: 'applications', permission: 'update' },
        children: [
          {
            path: '',
            redirectTo: 'step1',
            pathMatch: 'full',
          },
          {
            path: 'step1',
            component: Step1Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step2',
            component: Step2Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step3',
            component: Step3Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step4',
            component: Step4Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step5',
            component: Step5Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step6',
            component: Step6Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step7',
            component: Step7Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step8',
            component: Step8Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'update' },
          },
          {
            path: 'step9',
            component: Step9Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
        ],
      },
      {
        path: 'applications/view/:id',
        component: NewComponent,
        canActivate: [AuthGuard],
        data: { component: 'applications', permission: 'view' },
        children: [
          {
            path: '',
            redirectTo: 'step1',
            pathMatch: 'full',
          },
          {
            path: 'step1',
            component: Step1Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step2',
            component: Step2Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step3',
            component: Step3Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step4',
            component: Step4Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step5',
            component: Step5Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step6',
            component: Step6Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step7',
            component: Step7Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step8',
            component: Step8Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
          {
            path: 'step9',
            component: Step9Component,
            canActivate: [AuthGuard],
            data: { component: 'applications', permission: 'view' },
          },
        ],
      },
      {
        path: 'permissions',
        component: RolesComponent,
        canActivate: [AuthGuard],
        data: { component: 'permissions', permission: 'view' },
        children: [
          {
            path: ':id',
            component: PermissionsComponent,
            canActivate: [AuthGuard],
            data: { component: 'role', permission: 'update' },
          },
        ],
      },
      {
        path: 'emails',
        component: EmailsComponent,
        canActivate: [AuthGuard],
        data: { component: 'emailtemplates', permission: 'view' },
      },
      {
        path: 'emails/new',
        component: NewEmailComponent,
        canActivate: [AuthGuard],
        data: { component: 'emailtemplates', permission: 'add' },
      },
      {
        path: 'emails/edit/:id',
        component: NewEmailComponent,
        canActivate: [AuthGuard],
        data: { component: 'emailtemplates', permission: 'update' },
      },
      {
        path: 'templates',
        component: TemplatesComponent,
        canActivate: [AuthGuard],
        data: { component: 'cmctemplates', permission: 'view' },
      },
      {
        path: 'templates/new',
        component: NewTemplateComponent,
        canActivate: [AuthGuard],
        data: { component: 'cmctemplates', permission: 'add' },
      },
      {
        path: 'templates/edit/:id',
        component: NewTemplateComponent,
        canActivate: [AuthGuard],
        data: { component: 'cmctemplates', permission: 'update' },
      },
      {
        path: 'users',
        component: UsersComponent,
        canActivate: [AuthGuard],
        data: { component: 'users', permission: 'view' },
      },
      {
        path: 'users/new',
        component: NewUserComponent,
        canActivate: [AuthGuard],
        data: { component: 'users', permission: 'add' },
      },
      {
        path: 'users/edit/:id',
        component: NewUserComponent,
        canActivate: [AuthGuard],
        data: { component: 'users', permission: 'update' },
      },
      {
        path: 'calendars',
        component: CalendarsComponent,
        canActivate: [AuthGuard],
        data: { component: 'calendars', permission: 'view' },
      },
      {
        path: 'checklists',
        component: ChecklistsComponent,
        canActivate: [AuthGuard],
        data: { component: 'checklists', permission: 'view' },
      },
      {
        path: 'checklists/new',
        component: NewChecklistComponent,
        canActivate: [AuthGuard],
        data: { component: 'checklists', permission: 'add' },
      },
      {
        path: 'checklists/edit/:id',
        component: NewChecklistComponent,
        canActivate: [AuthGuard],
        data: { component: 'checklists', permission: 'update' },
      },
      {
        path: 'content',
        component: ContentComponent,
        canActivate: [AuthGuard],
        data: { component: 'content', permission: 'view' },
      },
      {
        path: 'content/edit/:id',
        component: NewContentComponent,
        canActivate: [AuthGuard],
        data: { component: 'content', permission: 'update' },
      },
      {
        path: 'aod',
        component: AodComponent,
        canActivate: [AuthGuard],
        data: { component: 'aod', permission: 'view' },
      },
      {
        path: 'aod/sign/:id',
        component: SignTemplateComponent,
        canActivate: [AuthGuard],
        data: { component: 'aod', permission: 'view' },
      },
      {
        path: 'aod/new/:employeeId',
        component: NewAodComponent,
        canActivate: [AuthGuard],
        data: { component: 'aod', permission: 'add' },
      },
      {
        path: 'aod/edit/:id',
        component: NewAodComponent,
        canActivate: [AuthGuard],
        data: { component: 'aod', permission: 'update' },
      },
      {
        path: 'customers',
        component: CustomersComponent,
        canActivate: [AuthGuard],
        data: { component: 'customers', permission: 'view' },
      },
      {
        path: 'customers/new',
        component: NewCustomerComponent,
        canActivate: [AuthGuard],
        data: { component: 'customers', permission: 'add' },
        children: [
          {
            path: '',
            redirectTo: 'details',
            pathMatch: 'full',
          },
          {
            path: 'details',
            component: DetailsComponent,
            canActivate: [AuthGuard],
            data: { component: 'customers', permission: 'add' },
          },
        ],
      },
      {
        path: 'customers/edit/:id',
        component: NewCustomerComponent,
        canActivate: [AuthGuard],
        data: { component: 'customers', permission: 'update' },
        children: [
          {
            path: '',
            redirectTo: 'details',
            pathMatch: 'full',
          },
          {
            path: 'details',
            component: DetailsComponent,
            canActivate: [AuthGuard],
            data: { component: 'customers', permission: 'update' },
          },
          {
            path: 'address',
            component: AddressComponent,
            canActivate: [AuthGuard],
            data: { component: 'customers', permission: 'update' },
          },
          {
            path: 'contacts',
            component: ContactsComponent,
            canActivate: [AuthGuard],
            data: { component: 'customers', permission: 'update' },
          },
          {
            path: 'configuration',
            component: ConfigurationComponent,
            canActivate: [AuthGuard],
            data: { component: 'customers', permission: 'update' },
          },
        ],
      },
    ],
  },
];
