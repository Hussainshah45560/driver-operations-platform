import { NextFunction, Request, Response } from 'express';
import { Document } from 'mongodb';
import { User } from '../models';
export interface Request extends Request {
	req: {} & object;
	files: MulterFile[];
	file: MulterFile;
	user: User;
	dbPagination: Document[];
	aggregations: Document[];
	session: [any];
	global: any;
}
export interface MulterFile {
	fieldname: string;
	originalname: string;
	encoding: string;
	mimetype: string;
	destination: string;
	filename: string;
	path: string;
	size: number
}

export interface NextFunction extends NextFunction { }
export interface Response extends Response { }