import { FieldError } from 'react-hook-form'

export type TServerFieldError<TFormValues> =
	| {
			ok: false
			field: keyof TFormValues
			error: FieldError
	  }
	| {
			ok: true
	  }
