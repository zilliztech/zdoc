import { IS_CLOUD_LANGUAGE_EN } from "@/Utils/ProductType";

export const ZILLIZ_DOC_BASE_URL =
  import.meta.env.VITE_DOC_URL || `https://docs.zilliz.com`;

export const ZILLIZ_SUPPORT_PORTAL_URL = IS_CLOUD_LANGUAGE_EN
  ? `https://support.zilliz.com/hc/en-us`
  : `https://support.zilliz.com.cn/hc/zh-cn`;

export const ZILLIZ_GET_STARTED_URL = IS_CLOUD_LANGUAGE_EN
  ? `https://support.zilliz.com/hc/en-us/articles/20973150063515-How-many-collections-and-partitions-are-allowed-in-a-single-cluster-`
  : `https://support.zilliz.com.cn/hc/zh-cn/articles/18147050289563-1-%E4%B8%AA%E9%9B%86%E7%BE%A4%E4%B8%AD%E6%9C%80%E5%A4%9A%E5%8F%AF%E5%88%9B%E5%BB%BA%E5%A4%9A%E5%B0%91%E4%B8%AA-Collection-%E5%92%8C-Partition-`;

export const ZILLIZ_CU_CAPACITY_DOC_URL = IS_CLOUD_LANGUAGE_EN
  ? `https://support.zilliz.com/hc/en-us/articles/21264969287195-What-can-I-do-if-my-CU-is-full-`
  : `https://support.zilliz.com.cn/hc/zh-cn/articles/21265037717659-%E5%A6%82%E6%9E%9C%E6%88%91%E7%9A%84-CU-%E5%AE%B9%E9%87%8F%E5%B7%B2%E6%BB%A1-%E6%97%A0%E6%B3%95%E8%BF%9B%E8%A1%8C%E6%93%8D%E4%BD%9C%E8%AF%A5%E6%80%8E%E4%B9%88%E5%8A%9E-`;

export const ZILLIZ_DOC_PREFIX = `${ZILLIZ_DOC_BASE_URL}/docs`;

export const PRIVATE_LINK_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link`;

export const AWS_VPC_ID_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-vpc-id`;
export const AWS_SUBNET_ID_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-subnet-id`;
export const AWS_ENDPOINT_ID_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-vpc-endpoint`;

export const GCP_PROJECT_ID_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-google-cloud-project-id`;
export const GCP_VPC_NAME_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-vpc-name`;
export const GCP_SUBNET_NAME_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-subset-name`;
export const GCP_ENDPOINT_PREFIX_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#set-an-endpoint-prefix`;
export const GCP_ENDPOINT_ID_LINK = `${ZILLIZ_DOC_PREFIX}/set-up-a-private-link#obtain-a-private-service-endpoint`;

export const CREATE_FIRST_CLUSTER_DOC = `${ZILLIZ_DOC_PREFIX}/create-cluster`;
export const CREATE_COLLECTION_DOC = `${ZILLIZ_DOC_PREFIX}/create-collection-2`;

export const CONNECT_TO_CLUSTER_DOC = `${ZILLIZ_DOC_PREFIX}/connect-to-cluster`;
export const CONNECT_TO_CLUSTER_SERVERLESS_DOC = `${ZILLIZ_DOC_PREFIX}/connect-to-cluster`;

export const MANAGE_MFA_DOC = `${ZILLIZ_DOC_PREFIX}/manage-mfa`;

//in cloud-zh, there is no EXAMPLE_DATASET_DOC
export const EXAMPLE_DATASET_DOC = `${ZILLIZ_DOC_PREFIX}/example-dataset`;
//in cloud-zh, there is no MIGRATION
export const MIGRATION_DOC = `${ZILLIZ_DOC_PREFIX}/migration-guides`;
export const MIGRATION_FROM_DEDICATED_DOC = `${ZILLIZ_DOC_PREFIX}/migrate-between-clusters#from-dedicated-cluster-to-another`;
export const BACKUP_DOC = `${ZILLIZ_DOC_PREFIX}/backup-and-restore`;
export const CREATE_SNAPSHOT_DOC = `${ZILLIZ_DOC_PREFIX}/create-snapshot`;
export const RESTORE_SNAPSHOT_DOC = `${ZILLIZ_DOC_PREFIX}/restore-from-snapshot`;

export const JSON_FORMAT_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/javascript-object-notation-json-1`;
export const INSERT_ENTITIES_FROM_LARGE_FILE_LINK = `${ZILLIZ_DOC_PREFIX}/import-data-on-web-ui#import-the-local-json-file`;
export const PATH_FORMAT_INSERT_ENTITIES_FROM_LARGE_FILE = `${ZILLIZ_DOC_PREFIX}/import-data-on-web-ui#supported-object-paths`;
export const INSERT_MORE_TYPE_FILE_LINK = `${ZILLIZ_DOC_PREFIX}/use-bulkwriter-for-data-import`;

export const SEARCH_WITH_FILTER_LINK = `${ZILLIZ_DOC_PREFIX}/search-query-and-get#search-with-filters`;

export const COLLECTION_OPERATIONS_DOC = `${ZILLIZ_DOC_BASE_URL}/reference/collection-operations`;
export const VECTOR_OPERATIONS_DOC = `${ZILLIZ_DOC_BASE_URL}/reference/vector-operations`;
export const CLOUD_META_DOC = `${ZILLIZ_DOC_BASE_URL}/reference/cloud-meta`;
export const CLUSTER_OPERATIONS_DOC = `${ZILLIZ_DOC_BASE_URL}/reference/cluster-operations`;
export const IMPORT_OPERATIONS_DOC = `${ZILLIZ_DOC_BASE_URL}/reference/import-operations`;

export const ORG_MEMBER_INVITE_DOC = `${ZILLIZ_DOC_PREFIX}/add-organization-members#invite-a-user-to-join-your-organization`;
export const ORG_MEMBER_EDIT_DOC = `${ZILLIZ_DOC_PREFIX}/roles-privileges`;
export const PROJECT_ROLE_DOC = `${ZILLIZ_DOC_PREFIX}/organizations-projects#project-roles`;
export const PROJECT_MEMBER_INVITE_DOC = `${ZILLIZ_DOC_PREFIX}/add-project-collaborators-2`;
export const PROJECT_MEMBER_EDIT_DOC = `${ZILLIZ_DOC_PREFIX}/add-project-collaborators-2#edit-a-collaborators-role-or-remove-a-collaborator`;

export const CU_DOC = `${ZILLIZ_DOC_PREFIX}/choose-the-right-cu-type-and-size`;

export const API_KEYS_LINK = `${ZILLIZ_DOC_PREFIX}/manage-api-keys`;
//in cloud-zh, there is no NO_PUBLIC_EMAIL_DOC_LINK
export const NO_PUBLIC_EMAIL_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/register-with-zilliz-cloud#linking-to-github-account`;

export const BYOC_ACTIVE_REGION_DOC_LICK = `${ZILLIZ_DOC_PREFIX}/byoc/activate-your-cloud`;

// not doc related links
export const DEMO_COLLECTION_DATASET_DOWNLOAD_LINK =
  "https://assets.zilliz.com/medium_articles_2020_dpr_a13e0377ae.json";

// marketplace related links
export const AWS_MARKETPLACE_LINK =
  "https://aws.amazon.com/marketplace/pp/prodview-iqbidum7feuio?sr=0-1&ref_=beagle&applicationId=AWSMPContessa";
export const GCP_MARKETPLACE_LINK =
  "https://console.cloud.google.com/marketplace/product/zilliz-public/zilliz-cloud?hl=hi-in";

export const ZILLIZ_WEBSITE_BASE_URL = IS_CLOUD_LANGUAGE_EN
  ? `https://zilliz.com`
  : `https://zilliz.com.cn`;

export const ZILLIZ_PRICING_HREF = `${ZILLIZ_WEBSITE_BASE_URL}/pricing`;
export const CU_ESTIMATE_LINK = `${ZILLIZ_WEBSITE_BASE_URL}/pricing#calculator`;
export const CONTACT_PATH = `${ZILLIZ_WEBSITE_BASE_URL}/contact`;
export const CONTACT_US_PATH = `${ZILLIZ_WEBSITE_BASE_URL}/contact-sales`;

export const TERMS_AND_CONDITION_LINK = IS_CLOUD_LANGUAGE_EN
  ? `${ZILLIZ_WEBSITE_BASE_URL}/terms-and-conditions`
  : `${ZILLIZ_WEBSITE_BASE_URL}/cloud-service-terms`;
export const PRIVACY_POLICY_LINK = IS_CLOUD_LANGUAGE_EN
  ? `${ZILLIZ_WEBSITE_BASE_URL}/privacy-policy`
  : `${ZILLIZ_WEBSITE_BASE_URL}/cloud-user-policy`;
export const COLLECT_PERSONAL_INFO_CN_LINK =
  "https://zilliz.com.cn/more-information";

export const AWS_MARKETPLACE_INVOICE_LINK =
  "https://console.aws.amazon.com/billing/home";
export const GCP_MARKETPLACE_INVOICE_LINK = `https://console.cloud.google.com/billing`;

export const ALI_MARKETPLACE_LINK =
  "https://market.aliyun.com/products/56024006/cmgj00063418.html";
export const ALI_MARKETPLACE_INVOICE_LINK =
  "https://usercenter2.aliyun.com/finance/expense-report/expense-detail";

export const CLOUD_REGION_REQUEST_LINK = `${ZILLIZ_WEBSITE_BASE_URL}/cloud-region-request`;

export const BETA_SEARCH_PARAMS_DOC_LINK = `${ZILLIZ_DOC_BASE_URL}/conduct-a-range-search`;
export const BETA_RELEASE_LINK = `${ZILLIZ_DOC_BASE_URL}/docs/release-notes-230`;

export const PRIVATE_LINK_ADD_UID_TO_WHITELIST_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/setup-a-private-link#register-private-link-params`;
export const PRIVATE_LINK_CREATE_ENDPOINT_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/setup-a-private-link#create-endpoint`;

export const AWS_UNSUBSCRIBE_MARKETPLACE_LINK = `https://docs.aws.amazon.com/marketplace/latest/buyerguide/cancel-subscription.html`;
export const ALI_UNSUBSCRIBE_MARKETPLACE_LINK = `https://help.aliyun.com/document_detail/151607.html`;
export const GCP_UNSUBSCRIBE_MARKETPLACE_LINK = `https://cloud.google.com/marketplace/docs/manage-billing#saas-products`;

export const BIND_CARD_TAX_TIP_LINK = `${ZILLIZ_DOC_PREFIX}/subscribe-by-adding-credit-card`;

export const CREATE_PIPELINE_LINK = `${ZILLIZ_DOC_PREFIX}/create-pipelines`;
export const CREATE_INGESTION_PIPELINE_LINK = `${ZILLIZ_DOC_PREFIX}/create-pipelines#create-ingestion-pipelines`;
export const CREATE_SEARCH_PIPELINE_LINK = `${ZILLIZ_DOC_PREFIX}/create-pipelines#create-search-pipelines`;
export const CREATE_DELETION_PIPELINE_LINK = `${ZILLIZ_DOC_PREFIX}/create-pipelines#create-deletion-pipelines`;
export const UNDERSTAND_PIPELINE_LINK = `${ZILLIZ_DOC_PREFIX}/understanding-pipelines`;
export const ADD_FUNCTION_PIPELINE_URL = `${ZILLIZ_DOC_PREFIX}/add-a-function-to-pipelines`;
export const PIPELINE_TOKEN_USAGE_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/estimate-pipelines-usage`;
export const DELETE_YOUR_ACCOUNT_URL = `${ZILLIZ_DOC_PREFIX}/delete-your-account`;
export const MANAGE_MFA_URL = `${ZILLIZ_DOC_PREFIX}/multi-factor-authentication`;

export const COLLECTION_SCHEMA_LINK = `${ZILLIZ_DOC_BASE_URL}/schema-explained`;

export const AWS_ACCESS_DOC_LINK = `https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey`;
export const GCP_ACCESS_DOC_LINK = `https://cloud.google.com/storage/docs/authentication/managing-hmackeys`;
export const AZURE_ACCESS_DOC_LINK = `https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys`;
export const ALI_ACCESS_DOC_LINK = `https://help.aliyun.com/zh/ram/user-guide/create-an-accesskey-pair`;

export const AUTOINDEX_DOC_LINK = `${ZILLIZ_DOC_BASE_URL}/autoindex-explained`;

export const TOPOLOGY_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/byoc/manage-cluster#view-cluster-details`;
export const VIEW_CODE_MORE_LANGUAGE_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/manage-collections-sdks`;

export const MANAGE_CLUSTER_DOC_LINK = `${ZILLIZ_DOC_PREFIX}/manage-cluster#manage-and-configure-cluster`;
