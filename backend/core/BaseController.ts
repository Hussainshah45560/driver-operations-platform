
import { Filter_Options, Request, Response } from '../__types';
import Validator from 'validatorjs';
import DataBase from './Database';
import { ObjectId } from 'mongodb';
/**
* @class BaseController
*/
export class BaseController extends DataBase {

	private readonly errors: { [key: string]: string } = {
		permission: "You don't have permission",
		notfound: "Data not found",
		invalid: "Invalid request",
		exist: "% already exist",
		required: "Please provide required information",
		create: 'Unable to create %',
		update: 'Unable to update %',
		list: 'Unable to get list of %\'s',
		get: 'Unable to get %',
		cantdelete: 'Can\'t delete this %, because this % profile has been used.',
		delete: 'Can\'t delete this %, error occurred',
		dontexist: '% doesn\'t exist',
		login: 'Please login to continue',
		token: 'Failed to authenticate token.',
		wrong: 'Something went wrong please try again later.',
	};
	constructor() {
		super();
		this.registerAsyncValidator();
	}
	protected json = (req: Request, res: Response, statusCode: number, ret: { data?: object | null, message?: string, accessToken?: string, refreshToken?: string, count?: any }): Response => {
		const { data, message, accessToken, refreshToken, count } = ret;
		const resp = { success: true };
		if (typeof (count) != "undefined") {
			resp['pagination'] = {
				total: (count.length > 0) ? count[0].total : 0,
				...this.getPagination(req)
			}
		}
		if (data) {
			if (data["data"]) {
				resp["data"] = data["data"];
			} else {
				resp["data"] = data;
			}
			// resp = Object.assign(resp, data)
		} else {
			resp["data"] = null;
		}
		if (message) {
			resp["message"] = message;
		}
		if (accessToken) {
			resp["accessToken"] = accessToken;
		}
		if (refreshToken) {
			resp["refreshToken"] = refreshToken;
		}
		return res.status(statusCode).json(resp);
	}
	protected jsonError = async (res: Response, statusCode: number, component?: string, error?, exception?) => {
		if (exception) {
			console.log(exception);
		}
		if (!error) {
			return res.sendStatus(statusCode);
		}
		return res.status(statusCode).json(this.error((component ?? ""), error));
	}
	protected error = (component: string, error) => {
		if (this.errors[error]) {
			return { success: false, message: this.errors[error].replace(/%/g, component.charAt(0).toUpperCase() + component.slice(1)) };
		} else {
			return { success: false, message: error };
		}
	}
	private readonly getPagination = (req: Request): { page: number, page_size: number } => {
		let page = 1;
		let page_size = global['config'].pagination.page_size;
		if (req.query['page']) {
			page = parseInt(req.query['page'].toString());
		}
		if (req.query['pageSize']) {
			page_size = parseInt(req.query['pageSize'].toString());
		}

		if (page_size > global['config'].pagination.maxLimit) {
			page_size = global['config'].pagination.maxLimit;
		}
		return { page, page_size }
	}
	protected getAggrigation = (req: Request, filter_options: Filter_Options, defaultFilter: object = {}, allow: boolean = true) => {
		const { search, defaultSort, filters } = filter_options;
		const data = defaultFilter;
		req.aggregations = [];
		req.dbPagination = [];
		Object.keys(req.query).forEach(qfield => {
			let field = qfield;
			if (qfield.indexOf("__") > -1) {
				field = qfield.split("__")[0];
			}
			if (filters[qfield]) {
				const { type, filter } = filters[qfield];
				let value: any = req.query[qfield];
				if (type == "boolean") {
					value = JSON.parse(value.toLowerCase());;
				}
				if (type == 'date') {
					value = new Date(value);
					if (filter == '$lte') {
						const timeToAdd = ((23 * 3600) + 3599.999) * 1000;
						value.setTime(value.getTime() + timeToAdd);
					}
				}
				if (filter === "$in") {
					value = value.split(",");
					if (type === "int") {
						value = value.map((str) => { return parseInt(str); });
					}
					if (type == "objectId") {
						value = value.map((str) => { return new ObjectId(str); });
					}
				} else if (type === "int") {
					value = parseInt(value);
				}

				if (filter === "eq") {
					data[field] = value;
				} else {
					if (!data[field]) {
						data[field] = {};
					}
					data[field][filter] = value;
				}
			}
		});
		if (allow && req.user && req.user.role) {
			if (['Developer', 'Admin'].indexOf(req.user.role.name) === -1) {
				 //data["profile.email"] = { $ne: "developer@loopbrackets.com"};
			}
		}
		if (req.query["q"]) {
			const q = req.query["q"].toString();
			if (search.length > 0) {
				const se = search.map(e => {
					const se = {};
					se[e] = new RegExp(q, "gim");
					return se;
				});
				data["$or"] = se;
			}
		}
		if (Object.keys(data).length > 0) {
			req.dbPagination.push({
				$match: data,
			});
			req.aggregations.push({
				$match: data,
			});
		}


		let rawParm;
		if (req.query['orderby']) {
			rawParm = req.query['orderby'];
		} else {
			rawParm = defaultSort;
		}

		let order = 1;
		if (req.query['orderdir']) {
			order = parseInt(req.query['orderdir'].toString());
		}
		const sort = {};
		sort[rawParm] = order;
		req.aggregations.push({
			$sort: sort,
		});

		// Pagination
		const pagination = this.getPagination(req);
		const skip = (pagination.page - 1) * pagination.page_size;

		// Pagination
		req.aggregations.push({ $skip: skip }, { $limit: pagination.page_size });
		req.dbPagination.push({
			$count: "total"
		});
	}
	registerAsyncValidator = () => {
		Validator.registerAsync(
			"exist",
			function (value: string, attribute, req, passes) {
				if (!attribute)
					throw new Error(
						"Specify Requirements i.e fieldName: exist:collection,column"
					);
				const attArr = attribute.split(",");

				if (attArr.length !== 2)
					throw new Error(`Invalid format for validation rule on ${attribute}`);
				const { 0: collection, 1: column } = attArr;

				const msg =
					column == "username"
						? `${column} has already been taken `
						: `${column} already in use`;
				const query = {};
				query[column] = value;
				const projection = {};
				projection[column] = 1;
				this.collections[collection]
					?.findOne(query, { projection })
					.then((result) => {
						if (result) {
							passes(false, msg); // if username is not available
						} else {
							passes(true);
						}
					});
			},
			"Username has already been taken."
		);
	}

	appLog = async (req: Request, component: string, action: string, documentId: ObjectId | null = null, after: object = {}) => {
		try {
			const data = {
				component: component,
				action: action,
				userId: req.user._id,
				ip: req.ip ? req.ip : "undefined",
				timestamp: new Date(Date.now()),
				documentId: documentId,
				after: after
			}

			await this.collections.logs.insertOne({ ...data })

		} catch (ex) {
			console.log(ex)
		}
	}
}
