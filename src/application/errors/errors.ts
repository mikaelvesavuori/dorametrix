/**
 * @description Used when an expected `Authorization` header is missing.
 */
export class MissingAuthorizationHeaderError extends Error {
  constructor() {
    super();
    this.name = 'MissingAuthorizationHeaderError';
    const message = `Missing an expected value in the "Authorization" header!`;
    this.message = message;
    // @ts-ignore
    this.cause = {
      statusCode: 400
    };
  }
}

/**
 * @description Used when an incorrect authorization token is used.
 */
export class InvalidAuthTokenError extends Error {
  constructor() {
    super();
    this.name = 'InvalidAuthTokenError';
    const message = `The provided authorization token is incorrect.`;
    this.message = message;
    // @ts-ignore
    this.cause = {
      statusCode: 400
    };
  }
}

/**
 * @description Used when a date to be ISO-formatted is not valid.
 */
export class InvalidIsoDateConversionError extends Error {
  constructor() {
    super();
    this.name = 'InvalidIsoDateConversionError';
    const message =
      'Either missing date to convert to ISO format or the length is not 8 characters long (YYYYMMDD format)!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 400
    };
  }
}

/**
 * @description Used when a provided offset is not valid.
 */
export class InvalidOffsetError extends Error {
  constructor() {
    super();
    this.name = 'InvalidOffsetError';
    const message = 'Offset in hours must be provided as a number between -12 and 12!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 400
    };
  }
}

/**
 * @description Missing required environment variables when setting up DynamoDB.
 */
export class MissingEnvironmentVariablesDynamoError extends Error {
  constructor() {
    super();
    this.name = 'MissingEnvironmentVariablesDynamoError';
    const message = `Missing required environment variables in DynamoDB!`;
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when headers are missing the event time.
 */
export class MissingEventError extends Error {
  constructor() {
    super();
    this.name = 'MissingEventError';
    const message = 'Missing event in getPayload()!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 400
    };
  }
}

/**
 * @description Used when an ID or event type is missing when creating events.
 */
export class MissingEventMetadataError extends Error {
  constructor() {
    super();
    this.name = 'MissingEventMetadataError';
    const message = 'Missing ID and/or eventType in createEvent()!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when headers are missing the event time.
 */
export class MissingEventTimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEventTimeError';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when a value object is missing the `eventType` property/value.
 */
export class MissingEventTypeValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingEventTypeValueError';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when an expected identifier is missing.
 */
export class MissingIdError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingIdError';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when a value object is missing the `id` property/value.
 */
export class MissingIdValueError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingIdValueError';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when a value object is missing the `repoName` property/value.
 */
export class MissingRepoNameError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MissingRepoNameError';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when all possible input query parameters are missing.
 */
export class MissingRequiredInputParamsError extends Error {
  constructor() {
    super();
    this.name = 'MissingRequiredInputParamsError';
    const message =
      'Unable to perform a query as either "to"/"from" or "last" parameters are missing.';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when something is missing time.
 */
export class MissingTimeError extends Error {
  constructor() {
    super();
    this.name = 'MissingTimeError';
    const message = 'Missing time in "convertDateToUnixTimestamp"!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when a queried date is out of range.
 */
export class OutOfRangeQueryError extends Error {
  constructor() {
    super();
    this.name = 'OutOfRangeQueryError';
    const message = 'The queried date is out of range.';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when all mutually exclusive query parameters are used at the same time.
 */
export class TooManyInputParamsError extends Error {
  constructor() {
    super();
    this.name = 'TooManyInputParamsError';
    const message = 'To perform a query use either "to"/"from" or "last" parameters.';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}

/**
 * @description Used when an unknown event type is encountered.
 */
export class UnknownEventTypeError extends Error {
  constructor() {
    super();
    this.name = 'UnknownEventTypeError';
    const message = 'Unknown event type seen in getEventType()!';
    this.message = message;
    //@ts-ignore
    this.cause = {
      statusCode: 500
    };
  }
}
