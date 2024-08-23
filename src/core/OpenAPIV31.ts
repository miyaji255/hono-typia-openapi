/**
 * Represents the root object of an OpenAPI document.
 */
export interface OpenAPISpec {
  /** The version of the OpenAPI Specification that the document conforms to.  */
  openapi: `3.1.${number}`;
  /** Provides metadata about the API.  */
  info: InfoObject;
  /** An array of Server Objects, which provide connectivity information to a target server.  */
  servers?: ServerObject[];
  /** The available paths and operations for the API.  */
  paths: PathsObject;
  /** Holds various reusable objects for different aspects of the OAS.  */
  components?: ComponentsObject;
  /** A declaration of which security mechanisms can be used across the API.  */
  security?: SecurityRequirementObject[];
  /** A list of tags used by the specification with additional metadata.  */
  tags?: TagObject[];
  /** Additional external documentation for the API.  */
  externalDocs?: ExternalDocumentationObject;
}

/**
 * The metadata about the API.
 */
export interface InfoObject {
  /** The title of the API.  */
  title: string;
  /** A short description of the API.  */
  description?: string;
  /** A URL to the Terms of Service for the API.  */
  termsOfService?: string;
  /** The contact information for the exposed API.  */
  contact?: ContactObject;
  /** The license information for the exposed API.  */
  license?: LicenseObject;
  /** The version of the OpenAPI document.  */
  version: string;
}

/**
 * Contact information for the API.
 */
export interface ContactObject {
  /** The identifying name of the contact person/organization.  */
  name?: string;
  /** The URL pointing to the contact information.  */
  url?: string;
  /** The email address of the contact person/organization.  */
  email?: string;
}

/**
 * License information for the API.
 */
export interface LicenseObject {
  /** The license name used for the API.  */
  name: string;
  /** An optional identifier for the license.  */
  identifier?: string;
  /** A URL to the license used for the API.  */
  url?: string;
}

/**
 * An object representing a server.
 */
export interface ServerObject {
  /** A URL to the target host.  */
  url: string;
  /** A short description of the server.  */
  description?: string;
  /** A map of variables used for substitution in the server's URL template.  */
  variables?: Record<string, ServerVariableObject>;
}

/**
 * A server variable for server URL template substitution.
 */
export interface ServerVariableObject {
  /** An enumeration of string values to be used if the substitution options are from a limited set.  */
  enum?: string[];
  /** The default value to use for substitution.  */
  default: string;
  /** A short description for the server variable.  */
  description?: string;
}

/**
 * Holds the relative paths to the individual endpoints and their operations.
 */
export interface PathsObject {
  /** A path and its associated operations.  */
  [path: string]: PathItemObject;
}

/**
 * Describes the operations available on a single path.
 */
export interface PathItemObject {
  /** Allows for a reference to an external resource for extended documentation.  */
  $ref?: string;
  /** A summary of what the path item offers.  */
  summary?: string;
  /** A description of the path item.  */
  description?: string;
  /** A definition of a GET operation on this path.  */
  get?: OperationObject;
  /** A definition of a PUT operation on this path.  */
  put?: OperationObject;
  /** A definition of a POST operation on this path.  */
  post?: OperationObject;
  /** A definition of a DELETE operation on this path.  */
  delete?: OperationObject;
  /** A definition of an OPTIONS operation on this path.  */
  options?: OperationObject;
  /** A definition of a HEAD operation on this path.  */
  head?: OperationObject;
  /** A definition of a PATCH operation on this path.  */
  patch?: OperationObject;
  /** A definition of a TRACE operation on this path.  */
  trace?: OperationObject;
  /** A list of servers available for this path.  */
  servers?: ServerObject[];
  /** A list of parameters applicable to all the operations described under this path.  */
  parameters?: ParameterObject[];
}

/**
 * Describes a single API operation on a path.
 */
export interface OperationObject {
  /** A list of tags for API documentation control.  */
  tags?: string[];
  /** A short summary of what the operation does.  */
  summary?: string;
  /** A verbose explanation of the operation behavior.  */
  description?: string;
  /** Additional external documentation for this operation.  */
  externalDocs?: ExternalDocumentationObject;
  /** Unique string used to identify the operation.  */
  operationId?: string;
  /** A list of parameters for the operation.  */
  parameters?: ParameterObject[];
  /** The request body applicable for this operation.  */
  requestBody?: RequestBodyObject;
  /** The list of possible responses as they are returned from executing this operation.  */
  responses: ResponsesObject;
  /** A map of possible out-of-band callbacks related to the parent operation.  */
  callbacks?: Record<string, CallbackObject>;
  /** Declares this operation to be deprecated.  */
  deprecated?: boolean;
  /** A declaration of which security mechanisms can be used for this operation.  */
  security?: SecurityRequirementObject[];
  /** An alternative list of servers to service this operation.  */
  servers?: ServerObject[];
}

/**
 * Allows referencing an external resource for extended documentation.
 */
export interface ExternalDocumentationObject {
  /** A short description of the target documentation.  */
  description?: string;
  /** The URL for the target documentation.  */
  url: string;
}

/**
 * Describes a single operation parameter.
 */
export interface ParameterObject {
  /** The name of the parameter.  */
  name: string;
  /** The location of the parameter.  */
  in: string; // "query" | "header" | "path" | "cookie"
  /** A brief description of the parameter.  */
  description?: string;
  /** Determines whether this parameter is mandatory.  */
  required?: boolean;
  /** Declares this parameter to be deprecated.  */
  deprecated?: boolean;
  /** Allows sending a parameter with an empty value.  */
  allowEmptyValue?: boolean;
  /** Describes how the parameter value will be serialized.  */
  style?: string;
  /** Specifies whether the parameter value should be exploded.  */
  explode?: boolean;
  /** Allows reserved characters to be included in the parameter value.  */
  allowReserved?: boolean;
  /** The schema defining the type used for the parameter.  */
  schema?: SchemaObject;
  /** Examples of the parameter.  */
  examples?: Record<string, ExampleObject>;
  /** A single example of the parameter.  */
  example?: any;
  /** A map containing the representations for the parameter.  */
  content?: Record<string, MediaTypeObject>;
}

/**
 * Describes a single request body.
 */
export interface RequestBodyObject {
  /** A brief description of the request body.  */
  description?: string;
  /** The content of the request body.  */
  content: Record<string, MediaTypeObject>;
  /** Determines if the request body is required in the request.  */
  required?: boolean;
}

/**
 * Describes a single media type.
 */
export interface MediaTypeObject {
  /** The schema defining the content type.  */
  schema?: SchemaObject;
  /** An example of the media type.  */
  example?: any;
  /** Examples of the media type.  */
  examples?: Record<string, ExampleObject>;
  /** A map of encoding properties for this media type.  */
  encoding?: Record<string, EncodingObject>;
}

/**
 * A single encoding definition applied to a schema property.
 */
export interface EncodingObject {
  /** The Content-Type for encoding a specific property.  */
  contentType?: string;
  /** A map of headers to be included with the encoded media.  */
  headers?: Record<string, HeaderObject>;
  /** Describes how a specific property value will be serialized.  */
  style?: string;
  /** Explodes the property value.  */
  explode?: boolean;
  /** Allows reserved characters to be included when serializing the property value.  */
  allowReserved?: boolean;
}

/**
 * A container for the expected responses of an operation.
 */
export interface ResponsesObject {
  /** The documentation of responses other than the ones declared for specific HTTP response codes. */
  default?: ResponseObject | ReferenceObject;
  /** Response objects by HTTP status code. */
  [httpStatusCode: number]: ResponseObject | ReferenceObject;
}

/**
 * Describes a single response from an API operation.
 */
export interface ResponseObject {
  /** A brief description of the response.  */
  description: string;
  /** A map of headers included with the response.  */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** A map of content types that could be produced by

 the response.  */
  content?: Record<string, MediaTypeObject>;
  /** A map of operations linked to the response.  */
  links?: Record<string, LinkObject | ReferenceObject>;
}

/**
 * Describes a map of possible out-of-band callbacks related to the parent operation.
 */
export interface CallbackObject {
  /** A map of the possible paths for the callback.  */
  [expression: string]: PathItemObject;
}

/**
 * Lists the required security schemes to execute this operation.
 */
export interface SecurityRequirementObject {
  /** The name of the security scheme.  */
  [name: string]: string[];
}

/**
 * Holds a set of reusable objects for different aspects of the OAS.
 */
export interface ComponentsObject {
  /** An object to hold reusable Schema Objects.  */
  schemas?: Record<string, SchemaObject | ReferenceObject>;
  /** An object to hold reusable Response Objects.  */
  responses?: Record<string, ResponseObject | ReferenceObject>;
  /** An object to hold reusable Parameter Objects.  */
  parameters?: Record<string, ParameterObject | ReferenceObject>;
  /** An object to hold reusable Example Objects.  */
  examples?: Record<string, ExampleObject | ReferenceObject>;
  /** An object to hold reusable Request Body Objects.  */
  requestBodies?: Record<string, RequestBodyObject | ReferenceObject>;
  /** An object to hold reusable Header Objects.  */
  headers?: Record<string, HeaderObject | ReferenceObject>;
  /** An object to hold reusable Security Scheme Objects.  */
  securitySchemes?: Record<string, SecuritySchemeObject | ReferenceObject>;
  /** An object to hold reusable Link Objects.  */
  links?: Record<string, LinkObject | ReferenceObject>;
  /** An object to hold reusable Callback Objects.  */
  callbacks?: Record<string, CallbackObject | ReferenceObject>;
  /** An object to hold reusable Path Item Objects.  */
  pathItems?: Record<string, PathItemObject | ReferenceObject>;
}

/**
 * The Schema Object allows the definition of input and output data types.
 */
export interface SchemaObject {
  /** The type of the schema.  */
  type?: string;
  /** Defines the items in an array schema.  */
  items?: SchemaObject | ReferenceObject;
  /** A map of property names to schema objects.  */
  properties?: Record<string, SchemaObject | ReferenceObject>;
  /** Defines whether additional properties are allowed in the schema.  */
  additionalProperties?: boolean | SchemaObject | ReferenceObject;
  /** A brief description of the schema.  */
  description?: string;
  /** The format of the schema (e.g., "date-time").  */
  format?: string;
  /** The default value for the schema.  */
  default?: any;
  /** Allows the schema to be nullable.  */
  nullable?: boolean;
  /** Enumerates the possible values for the schema.  */
  enum?: any[];
  /** Defines the schema as a combination of several schemas.  */
  allOf?: Array<SchemaObject | ReferenceObject>;
  /** Defines the schema as one of several schemas.  */
  oneOf?: Array<SchemaObject | ReferenceObject>;
  /** Defines the schema as any of several schemas.  */
  anyOf?: Array<SchemaObject | ReferenceObject>;
  /** Defines a schema that cannot be satisfied.  */
  not?: SchemaObject | ReferenceObject;
}

/**
 * A simple object to allow referencing other components in the OpenAPI document.
 */
export interface ReferenceObject {
  /** The reference identifier.  */
  $ref: string;
}

/**
 * A single example of a media type, parameter, or schema.
 */
export interface ExampleObject {
  /** A short summary of the example.  */
  summary?: string;
  /** A brief description of the example.  */
  description?: string;
  /** The value of the example.  */
  value?: any;
  /** A URL that points to the literal example.  */
  externalValue?: string;
}

/**
 * Describes a single header in a response or request.
 */
export interface HeaderObject extends ParameterObject {}

/**
 * A representation of a possible link between responses and other operations.
 */
export interface LinkObject {
  /** A relative or absolute reference to an OAS operation.  */
  operationRef?: string;
  /** The name of an existing operation in the OpenAPI document.  */
  operationId?: string;
  /** A map of parameters to pass to the linked operation.  */
  parameters?: Record<string, any>;
  /** A request body to send to the linked operation.  */
  requestBody?: any;
  /** A brief description of the link.  */
  description?: string;
  /** A server object to be used by the target operation.  */
  server?: ServerObject;
}

/**
 * Defines a security scheme that can be used by the operations.
 */
export interface SecuritySchemeObject {
  /** The type of the security scheme.  */
  type: string; // "apiKey" | "http" | "oauth2" | "openIdConnect"
  /** A brief description of the security scheme.  */
  description?: string;
  /** The name of the header, query, or cookie parameter to be used.  */
  name?: string;
  /** The location of the API key.  */
  in?: string; // "query" | "header" | "cookie"
  /** The name of the HTTP Authorization scheme to be used.  */
  scheme?: string;
  /** A hint to the client to identify how the bearer token is formatted.  */
  bearerFormat?: string;
  /** The flow definitions for OAuth2 security schemes.  */
  flows?: OAuthFlowsObject;
  /** OpenID Connect URL to discover OAuth2 authorization endpoints.  */
  openIdConnectUrl?: string;
}

/**
 * Allows configuration of multiple OAuth2 flow objects.
 */
export interface OAuthFlowsObject {
  /** Configuration for the OAuth2 implicit flow.  */
  implicit?: OAuthFlowObject;
  /** Configuration for the OAuth2 password flow.  */
  password?: OAuthFlowObject;
  /** Configuration for the OAuth2 client credentials flow.  */
  clientCredentials?: OAuthFlowObject;
  /** Configuration for the OAuth2 authorization code flow.  */
  authorizationCode?: OAuthFlowObject;
}

/**
 * Configuration for an OAuth2 flow.
 */
export interface OAuthFlowObject {
  /** The authorization URL for obtaining an authorization code.  */
  authorizationUrl?: string;
  /** The token URL for obtaining an access token.  */
  tokenUrl?: string;
  /** The URL for obtaining a refresh token.  */
  refreshUrl?: string;
  /** The available scopes for the OAuth2 security scheme.  */
  scopes?: Record<string, string>;
}

/**
 * Adds metadata to a single tag used by the Operation Object.
 */
export interface TagObject {
  /** The name of the tag.  */
  name: string;
  /** A brief description of the tag.  */
  description?: string;
  /** External documentation for the tag.  */
  externalDocs?: ExternalDocumentationObject;
}
