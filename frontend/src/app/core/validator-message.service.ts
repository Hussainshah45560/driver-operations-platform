import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';

@Injectable({
	providedIn: 'root'
})
export class ValidatorMessageService {
	public getValidatorErrorMessage(validatorName: string | null, validatorValue: ValidationErrors) {
		let config: any = {
			'required': 'Required',
			'minlength': `Minimum length ${validatorValue['requiredLength']}`,
			'maxlength': `Maximum length ${validatorValue['requiredLength']}`,
			'customMin': `Min number of digits are 3`,
			'minCardNumber': `Min number of digits are 13`,
			'customMax': `Max number of digits are 4`,
			'maxCardNumber': `Max number of digits are 16`,
			'email': 'Invalid email address',
			'phoneNumber': 'Invalid format',
			'mobilePhone': 'Invalid format',
			'homePhone': 'Invalid format',
			'calendlyAddress': 'Invalid format',
			'referenceContact': 'Invalid format',
			'userTaken': 'Username Already Taken',
			'duplicateId': 'Record already exist',
			'duplicateCode': 'Record Already Exists',
			'max': `Max Value ${validatorValue['max']}`,
			'min': `Min Value ${validatorValue['min']}`,
			'dropdownSelect': 'Please select option from dorpdown',
			'password': '1 uppercase, 1 numbers, lowercase and 1 special charactres',
			'confirm_password': '1 uppercase, 1 numbers, lowercase and 1 special charactres',
			'website' : 'invlalid format  for wesbite',
			'subdomain' : 'invlalid format  for subdomain',
			'color': 'Please Enter correct Color Hex. ie "#F00F00"',
			'username': 'Only digits and aphabits are allowed',
			'mustMatch': 'Password doesn\'t match',
			'emailTaken': 'Email already exists',
			'usernameTaken': 'Username already exists',
			'fileType': `Only (${validatorValue}) types are allowed`,
			'lettersOnly': `Only letters are allowed`,
			'numbersOnly': 'Only numbers are allowed',
			'numberdash': 'Only numbers and dash are allowed',
			'zipCode':'Invalid zip Format i.e 12345'
		};
		switch (validatorValue['requiredPattern']) {
			case '^[a-zA-Z]*$':
				validatorName = 'lettersOnly';
				break;
			case '^[A-Za-z]*$':
				validatorName = 'lettersOnly'
				break;
			case '/^[\\d-]*$/':
				validatorName = 'numberdash';
				break;
			case '/^\\d*$/':
				validatorName = 'numbersOnly';
				break;
		}
		if (validatorName) {
			return config[validatorName];
		}
		return null;
	}

}

