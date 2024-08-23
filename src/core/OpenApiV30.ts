/**
 * Represents an OpenAPI Specification.
 */
export interface OpenAPISpec {
  /** The OpenAPI version of this document. */
  openapi: `3.0.${number}`;
  /** Provides metadata about the API. */
  info: InfoObject;
  /** An array of Server Objects, which provide connectivity information to a target server. If the servers property is not provided, or is an empty array, the default value would be a Server Object with a url value of /. */
  servers?: ServerObject[];
  /** The available paths and operations for the API. */
  paths: PathsObject;
  /** An element to hold various schemas for the specification. */
  components?: ComponentsObject;
  /** A declaration of which security mechanisms can be used across the API. */
  security?: SecurityRequirementObject[];
  /** A list of tags used by the specification with additional metadata. */
  tags?: TagObject[];
  /** Additional external documentation. */
  externalDocs?: ExternalDocumentationObject;
}

/**
 * Contains metadata about the API.
 */
export interface InfoObject {
  /** The title of the API. */
  title: string;
  /** A short description of the API. */
  description?: string;
  /** A URL to the Terms of Service for the API. */
  termsOfService?: string;
  /** The license information for the exposed API. */
  contact?: ContactObject;
  /** License information for the API. */
  license?: LicenseObject;
  /** The version of the OpenAPI document (which is distinct from the OpenAPI Specification version or the API implementation version). */
  version: string;
}

/**
 * Contact information for the API.
 */
export interface ContactObject {
  /** The identifying name of the contact person/organization. */
  name?: string;
  /** The URL pointing to the contact information. */
  url?: string;
  /** The email address of the contact person/organization. */
  email?: string;
}

/**
 * License information for the API.
 */
export interface LicenseObject {
  /** The license name used for the API. */
  name: string;
  /** A URL to the license used for the API. */
  url?: string;
}

/**
 * A server providing API operations.
 */
export interface ServerObject {
  /**
   * A URL to the target host. This URL supports Server Variables and MAY be relative,
   * to indicate that the host location is relative to the location where the OpenAPI document is being served.
   *
   * Variable substitutions will be made when a variable is named in {brackets}.
   */
  url: string;
  /** An optional string describing the host designated by the URL. */
  description?: string;
  /** A map between a variable name and its value. */
  variables?: Record<string, ServerVariableObject>;
}

/**
 * A variable for a server URL.
 */
export interface ServerVariableObject {
  /** An enumeration of string values to be used if the substitution options are from a limited set. */
  enum?: string[];
  /** The default value to use for substitution. */
  default: string;
  /** An optional description for the server variable. */
  description?: string;
}

/**
 * Holds the relative paths to the individual endpoints and their operations.
 */
export interface PathsObject {
  /** A relative path to an individual endpoint. */
  [path: string]: PathItemObject;
}

/**
 * Describes the operations available on a single path.
 */
export interface PathItemObject {
  /** A reference to an external definition of this path item. */
  $ref?: string;
  /** An optional summary of this path item. */
  summary?: string;
  /** A description of this path item. */
  description?: string;
  /** A definition of a GET operation on this path. */
  get?: OperationObject;
  /** A definition of a PUT operation on this path. */
  put?: OperationObject;
  /** A definition of a POST operation on this path. */
  post?: OperationObject;
  /** A definition of a DELETE operation on this path. */
  delete?: OperationObject;
  /** A definition of an OPTIONS operation on this path. */
  options?: OperationObject;
  /** A definition of a HEAD operation on this path. */
  head?: OperationObject;
  /** A definition of a PATCH operation on this path. */
  patch?: OperationObject;
  /** A definition of a TRACE operation on this path. */
  trace?: OperationObject;
  /** A list of servers that can be used for this path. */
  servers?: ServerObject[];
  /** A list of parameters that are applicable for all the operations described under this path. */
  parameters?: ParameterObject[];
}

/**
 * Describes a single API operation on a path.
 */
export interface OperationObject {
  /** A list of tags for API documentation control. */
  tags?: string[];
  /** A short summary of what the operation does. */
  summary?: string;
  /** A verbose explanation of the operation behavior. */
  description?: string;
  /** Additional external documentation for this operation. */
  externalDocs?: ExternalDocumentationObject;
  /** A unique identifier for the operation. */
  operationId?: string;
  /** A list of parameters applicable for this operation. */
  parameters?: ParameterObject[];
  /** The request body applicable for this operation. */
  requestBody?: RequestBodyObject;
  /** The list of possible responses as they are returned from executing this operation. */
  responses: ResponsesObject;
  /** A map of possible out-of-band callbacks related to the parent operation. */
  callbacks?: Record<string, CallbackObject>;
  /** Declares this operation to be deprecated. */
  deprecated?: boolean;
  /** A declaration of which security mechanisms can be used for this operation. */
  security?: SecurityRequirementObject[];
  /** An alternative server array to service this operation. */
  servers?: ServerObject[];
}

/**
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocumentationObject {
  /** A short description of the target documentation. */
  description?: string;
  /** The URL for the target documentation. */
  url: string;
}

/**
 * Describes a single operation parameter.
 */
export interface ParameterObject {
  /** The name of the parameter. */
  name: string;
  /** The location of the parameter. */
  in: "query" | "header" | "path" | "cookie";
  /** A brief description of the parameter. */
  description?: string;
  /** Determines whether this parameter is mandatory. */
  required?: boolean;
  /** Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. */
  deprecated?: boolean;
  /** Sets the ability to pass empty-valued parameters. */
  allowEmptyValue?: boolean;
  /** Describes how the parameter value will be serialized depending on the type of the parameter value. */
  style?: string;
  /** When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. */
  explode?: boolean;
  /** Allows reserved characters to be included without percent-encoding. */
  allowReserved?: boolean;
  /** The schema defining the type used for the parameter. */
  schema?: SchemaObject;
  /** Example of the parameter's potential value. */
  example?: any;
  /** Examples of the parameter's potential values. */
  examples?: Record<string, ExampleObject>;
  /** A map containing the representations for the parameter. */
  content?: Record<string, MediaTypeObject>;
}

/**
 * Describes a single request body.
 */
export interface RequestBodyObject {
  /** A brief description of the request body. */
  description?: string;
  /** The content of the request body. */
  content: Record<string, MediaTypeObject>;
  /** Determines if the request body is required in the request. */
  required?: boolean;
}

/**
 * Describes a single media type.
 */
export interface MediaTypeObject {
  /** The schema defining the type used for the media type. */
  schema?: SchemaObject | ReferenceObject;
  /** Example of the media type's potential value. */
  example?: any;
  /** Examples of the media type's potential values. */
  examples?: Record<string, ExampleObject | ReferenceObject>;
  /** A map between a property name and its encoding information. */
  encoding?: Record<string, EncodingObject>;
}

/**
 * A single encoding definition applied to a single schema property.
 */
export interface EncodingObject {
  /** The content-type for encoding a specific property. */
  contentType?: string;
  /** A map allowing additional information to be provided as headers. */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** Describes how a specific property value will be serialized depending on its type. */
  style?: string;
  /** When this is true, property values of type array or object generate separate parameters for each value of the array or key-value pair of the map. */
  explode?: boolean;
  /** Allows reserved characters to be included without percent-encoding. */
  allowReserved?: boolean;
}

/**
 * A container for the expected responses of an operation.
 */
export interface ResponsesObject {
  /** The response code and the expected response. */
  [statusCode: string]: ResponseObject | ReferenceObject;
}

/**
 * Describes a single response from an API operation.
 */
export interface ResponseObject {
  /** A short description of the response. */
  description: string;
  /** Maps headers to their definitions. */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** A map containing descriptions of potential response payloads. */
  content?: Record<string, MediaTypeObject>;
  /** A map of operations links that can be followed from the response. */
  links?: Record<string, LinkObject | ReferenceObject>;
}

/**
 * A map of possible out-of-band callbacks related to the parent operation.
 */
export interface CallbackObject {
  /** A key-value pair representing the URL and the PathItemObject for the callback. */
  [url: string]: PathItemObject;
}

/**
 * An example object.
 */
export interface ExampleObject {
  /** A short summary of the example. */
  summary?: string;
  /** A brief description of the example. */
  description?: string;
  /** Embedded literal example. */
  value?: any;
  /** A URL that points to the literal example. */
  externalValue?: string;
}

/**
 * Describes a single link from an API operation response.
 */
export interface LinkObject {
  /** A relative or absolute reference to an OAS operation. */
  operationRef?: string;
  /** The name of an existing, resolvable OAS operation, as defined with a unique operationId. */
  operationId?: string;
  /** A map representing parameters to pass to an operation as specified with operationId or identified via operationRef. */
  parameters?: Record<string, any>;
  /** A literal value or {expression} to use as a request body when calling the target operation. */
  requestBody?: any;
  /** A description of the link. */
  description?: string;
  /** A server object to be used by the target operation. */
  server?: ServerObject;
}

/**
 * The header object follows the structure of the parameter object.
 */
export type HeaderObject = {
  /** A brief description of the parameter. */
  description?: string;
  /** Specifies that a parameter is deprecated and SHOULD be transitioned out of usage. */
  deprecated?: boolean;
  /** Determines whether this parameter is mandatory. */
  required?: boolean;
  /** Sets the ability to pass empty-valued parameters. */
  allowEmptyValue?: never;
} & (
  | {
      /** Describes how the parameter value will be serialized depending on the type of the parameter value. */
      style?: string;
      /** When this is true, parameter values of type array or object generate separate parameters for each value of the array or key-value pair of the map. */
      explode?: boolean;
      /** Allows reserved characters to be included without percent-encoding. */
      allowReserved?: boolean;
      /** The schema defining the type used for the parameter. */
      schema?: SchemaObject | ReferenceObject;
      /** Example of the parameter's potential value. */
      example?: any;
      /** Examples of the parameter's potential values. */
      examples?: Record<string, ExampleObject | ReferenceObject>;
    }
  | {
      /** A map containing the representations for the parameter. */
      content?: Record<string, MediaTypeObject>;
    }
);

/**
 * Holds a set of reusable objects for different aspects of the OAS.
 */
export interface ComponentsObject {
  /** An object to hold reusable Schema Objects. */
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  /** An object to hold reusable Response Objects. */
  responses?: Record<string, ResponseObject | ReferenceObject>;
  /** An object to hold reusable Parameter Objects. */
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  /** An object to hold reusable Example Objects. */
  examples?: Record<string, ExampleObject | ReferenceObject>;
  /** An object to hold reusable Request Body Objects. */
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  /** An object to hold reusable Header Objects. */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** An object to hold reusable Security Scheme Objects. */
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  /** An object to hold reusable Link Objects. */
  links?: Record<string, LinkObject | ReferenceObject>;
  /** An object to hold reusable Callback Objects. */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
}

/**
 * The schema object allows the definition of input and output data types.
 */
export interface SchemaObject {
  /** The type of the schema. */
  type?: string;
  /** Nested schema for items in an array. */
  items?: SchemaObject | ReferenceObject;
  /** Property definitions. */
  properties?: Record<string, SchemaObject | ReferenceObject>;
  /** Allows for properties that are not defined in the schema. */
  additionalProperties?: SchemaObject | ReferenceObject | boolean;
  /** A brief description of the schema. */
  description?: string;
  /** The format of the schema. */
  format?: string;
  /** The default value of the schema. */
  default?: any;
  /** Allows sending a null value for the defined schema. */
  nullable?: boolean;
  /** Specifies the required properties. */
  required?: string[];
  /** An enumeration of possible values. */
  enum?: any[];
  /** Combines multiple schemas. */
  allOf?: (SchemaObject | ReferenceObject)[];
  /** Validates against exactly one of the schemas. */
  oneOf?: (SchemaObject | ReferenceObject)[];
  /** Validates against any of the schemas. */
  anyOf?: (SchemaObject | ReferenceObject)[];
  /** Negates the schema. */
  not?: SchemaObject | ReferenceObject;
  /** A title for the schema. */
  title?: string;
  /** A multiple of a number for validation. */
  multipleOf?: number;
  /** The maximum value for the schema. */
  maximum?: number;
  /** Specifies that the maximum value is exclusive. */
  exclusiveMaximum?: boolean;
  /** The minimum value for the schema. */
  minimum?: number;
  /** Specifies that the minimum value is exclusive. */
  exclusiveMinimum?: boolean;
  /** The maximum length for a string value. */
  maxLength?: number;
  /** The minimum length for a string value. */
  minLength?: number;
  /** A regular expression for string values. */
  pattern?: string;
  /** The maximum number of items in an array. */
  maxItems?: number;
  /** The minimum number of items in an array. */
  minItems?: number;
  /** Specifies that array items must be unique. */
  uniqueItems?: boolean;
  /** The maximum number of properties in an object. */
  maxProperties?: number;
  /** The minimum number of properties in an object. */
  minProperties?: number;
  /** Examples for the schema. */
  examples?: any[];
  /** Adds support for polymorphism. */
  discriminator?: DiscriminatorObject;
  /** Indicates if the schema is read-only. */
  readOnly?: boolean;
  /** Indicates if the schema is write-only. */
  writeOnly?: boolean;
  /** A metadata object that allows for more fine-tuned XML model definitions. */
  xml?: XMLObject;
  /** Allows referencing an external resource for extended documentation. */
  externalDocs?: ExternalDocumentationObject;
}

/**
 * A simple object to allow referencing other components in the specification, internally and externally.
 */
export interface ReferenceObject {
  /** A URI reference to the definition. */
  $ref: string;
}

/**
 * Adds support for polymorphism.
 */
export interface DiscriminatorObject {
  /** The name of the property in the payload that will hold the discriminator value. */
  propertyName: string;
  /** An object to hold mappings between payload values and schema names or references. */
  mapping?: Record<string, string>;
}

/**
 * A metadata object that allows for more fine-tuned XML model definitions.
 */
export interface XMLObject {
  /** Replaces the name of the element/attribute used for the described schema property. */
  name?: string;
  /** The URI of the namespace definition. */
  namespace?: string;
  /** The prefix to be used for the name. */
  prefix?: string;
  /** Declares whether the property is an attribute. */
  attribute?: boolean;
  /** Signifies whether the array is wrapped. */
  wrapped?: boolean;
}

/**
 * Lists the required security schemes to execute this operation.
 */
export interface SecurityRequirementObject {
  /** The name of the security scheme. */
  [name: string]: string[];
}

/**
 * Defines a security scheme that can be used by the operations.
 */
export interface SecuritySchemeObject {
  /** The type of the security scheme. */
  type: "apiKey" | "http" | "oauth2" | "openIdConnect";
  /** A short description for security scheme. */
  description?: string;
  /** The name of the header, query, or cookie parameter to be used. */
  name?: string;
  /** The location of the API key. */
  in?: "query" | "header" | "cookie";
  /** The name of the HTTP Authorization scheme to be used in the Authorization header. */
  scheme?: string;
  /** A hint to the client to identify how the bearer token is formatted. */
  bearerFormat?: string;
  /** An object to hold configuration details for the supported flow types. */
  flows?: OAuthFlowsObject;
  /** OpenId Connect URL to discover OAuth2 configuration values. */
  openIdConnectUrl?: string;
}

/**
 * Allows configuration of the supported OAuth Flows.
 */
export interface OAuthFlowsObject {
  /** Configuration for the OAuth Implicit flow. */
  implicit?: OAuthFlowObject;
  /** Configuration for the OAuth Resource Owner Password flow. */
  password?: OAuthFlowObject;
  /** Configuration for the OAuth Client Credentials flow. */
  clientCredentials?: OAuthFlowObject;
  /** Configuration for the OAuth Authorization Code flow. */
  authorizationCode?: OAuthFlowObject;
}

/**
 * Configuration details for a supported OAuth Flow.
 */
export interface OAuthFlowObject {
  /** The authorization URL to be used for this flow. */
  authorizationUrl: string;
  /** The token URL to be used for this flow. */
  tokenUrl: string;
  /** The URL to be used for obtaining refresh tokens. */
  refreshUrl?: string;
  /** The available scopes for the OAuth2 security scheme. */
  scopes: Record<string, string>;
}

/**
 * Adds metadata to a single tag that is used by the Operation Object.
 */
export interface TagObject {
  /** The name of the tag. */
  name: string;
  /** A short description for the tag. */
  description?: string;
  /** Additional external documentation for this tag. */
  externalDocs?: ExternalDocumentationObject;
}
