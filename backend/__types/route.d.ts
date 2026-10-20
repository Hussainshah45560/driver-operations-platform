import { Request, Response } from 'express';
import { z } from "zod";
export interface route {
	path: string;
	method: string;
	function: RouteHandler;
	uploader?: RouteHandler;
	private: boolean;
	permission?: string;
	perm_component?: string;
	validationSchema?: z.ZodTypeAny | ((req: Request) => z.ZodTypeAny);
	
}

export type RouteHandler = (req: Request, res: Response) =>  Promise<Response>;