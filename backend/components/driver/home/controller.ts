import { BaseController } from "../../../core";
import { Request, Response } from "../../../__types";

export default class HomeController extends BaseController {
  public __component: string = "home";
  // private filter_options: Filter_Options = {
  //   search: ["name"],
  //   defaultSort: "_id",
  //   filters: {},
  // };

  public getDashboardSummary = async (
    req: Request,
    res: Response,
  ): Promise<Response> => {
    try {
      const applicationSteps = [
        {
          title: "Personal Details",
          step: "step1",
        },
        {
          title: "Contacts",
          step: "step2",
        },
        {
          title: "Education",
          step: "step3",
        },
        {
          title: "Employment",
          step: "step4",
        },
        {
          title: "Driver Details",
          step: "step5",
        },
        {
          title: "Assets",
          step: "step6",
        },
        {
          title: "Security",
          step: "step7",
        },
        {
          title: "Documents",
          step: "step8",
        },
        {
          title: "POPIA & Consent",
          step: "step9",
        },
      ];
      const userId = req.user._id;
      const profileId = req.user.profileId;
      const defaultFilter = {
        userId: userId,
      };
      const user = await this.collections.userProfiles.findOne({
        _id: profileId,
      });
      if (!user) {
        return this.jsonError(res, 400, this.__component, "get");
      }

      const applicationData = await this.collections.applications
        .aggregate([
          { $match: { ...defaultFilter, isDeleted: { $ne: true } } },
          {
            $lookup: {
              from: "assets",
              localField: "_id",
              foreignField: "applicationId",
              as: "asset",
            },
          },
        ])
        .toArray();
      const rejectedSteps: {
        step: string;
        status: string;
        title: string | null;
        reason: string | null;
      }[] = [];
      const application = applicationData[0];
      if (application?.stepStatus) {
        for (let i = 1; i <= 9; i++) {
          const stepKey = `step${i}` as keyof typeof application.stepStatus;
          const reasonKey =
            `step${i}Reason` as keyof typeof application.stepReject;
          const status = application.stepStatus[stepKey];

          if (status === "rejected" || status === "not confirmed") {
            rejectedSteps.push({
              step: `Step ${i}`,
              title:
                applicationSteps.find((step) => step.step === stepKey)?.title ||
                null,
              status,
              reason: application.stepReject?.[reasonKey] || null,
            });
          }
        }
      }
      const recruitment = await this.collections.recruitments
        .aggregate([
          {
            $match: {
              $or: [
                {
                  finalisedIds: { $exists: true, $in: [application?._id] },
                },
                {
                  shortListedIds: { $exists: true, $in: [application?._id] },
                },
              ],
            },
          },
          {
            $lookup: {
              from: "customers",
              localField: "customerId",
              foreignField: "_id",
              as: "customer",
            },
          },
        ])
        .toArray();

      const warnings = await this.collections.disciplinaries
        .aggregate([
          { $match: { profileId } },
          { $unwind: "$warnings" },
          { $match: { "warnings.isRead": false } },
          {
            $group: {
              _id: "$profileId",
              unreadCount: { $sum: 1 },
            },
          },
        ])
        .toArray();
      const unreadWarnings = warnings?.[0]?.unreadCount || 0;

      const queries = await this.collections.queries
        .find({ profileId: profileId })
        .toArray();

      const tests = await this.collections.tests
        .find({ userId: userId })
        .toArray();

      const contract = await this.collections.contracts.findOne({
        userId: req.user._id,
      });

      const selfie = await this.collections.documents.findOne({
        userId: userId,
        type: "Selfie",
      });
      const data = {
        name: user.firstName + " " + user.lastName,
        asset:
          application?.asset && application?.asset?.length > 0
            ? application?.asset[0].registrationNumber
            : null,
        applicationStatus: application ? application.applicationStatus : null,
        applicationCategory: application
          ? application.applicationCategory
          : null,
        applicationNumber: application ? application.applicationNumber : null,
        selfie: selfie ? selfie.url : null,
        unreadWarnings,
        queryCount: queries.length,
        testCount: tests.length,
        rejectedSteps,
        customerName:
          recruitment?.[recruitment.length - 1]?.customer &&
          recruitment?.[recruitment.length - 1]?.customer.length > 0
            ? recruitment?.[recruitment.length - 1]?.customer[0].name
            : null,
        recruitmentStatus:
          recruitment?.[recruitment.length - 1]?.status || null,
        recruitmentId: recruitment?.[recruitment.length - 1]?._id || null,
        showLogoutNotice:
          contract && contract?.status === "signed" && req.query.role === "Applicant",
        showSignNotice:
          contract && contract?.status === "unsigned" && req.query.role === "Applicant",
      };
      return this.json(req, res, 200, { data });
    } catch (error) {
      return this.jsonError(res, 500, this.__component, "invalid", error);
    }
  };
}
