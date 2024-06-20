---
slug: /user-roles
beta: FALSE
notebook: FALSE
type: origin
token: AFNZwDcXNiChK0ke5h5c65xZnje
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# User Roles

In Zilliz Cloud, Role-based Access Control (RBAC) is pivotal for delineating permissions across organizations, projects, and clusters. This system allows organization and project owners to efficiently manage user roles and access, maintaining streamlined operations and security.

For a deeper understanding of how organizations and projects are structured, refer to [Resource Hierarchy](./resource-hierarchy).

## Organization roles{#organization-roles}

To manage access and actions at the organization level, Zilliz Cloud introduces two organization roles, delineating who can access which modules and perform specified actions.

- **Organization Owner**: has full administration access to the organization, including organization settings, all projects in the organization, and associated resources.

- **Organization Member**: has limited access to the organization, where they can view organization settings and invite users to join the organization. The specific scope of permission on project- and cluster-level resources owned by an organization member is determined by their project roles.

## Project roles{#project-roles}

At the project level, two roles are introduced to enable finer-grained access control:

- **Project Owner**: has full administration access to the project, including project settings, all clusters in the project, and associated resources.

- **Project Member**: has read and write access to clusters within the project, where they can view cluster details and manage collections and indexes.

## Cluster built-in roles{#cluster-built-in-roles}

### Default user with `Admin` role{#default-user-with-admin-role}

Upon the creation of a cluster in Zilliz Cloud, a default cluster user, named `db_admin`, is established. Zilliz Cloud automatically generates the password for this user. Equipped with the `Admin` role, the `db_admin` user has full access to all cluster-level resources and operations.

<Admonition type="info" icon="📘" title="Notes">

<p>The creator of the cluster is automatically assigned the <code>Admin</code> role.</p>

</Admonition>

### Additional users with built-in roles{#additional-users-with-built-in-roles}

In addition to the default `db_admin` user, you can also add and manage extra cluster users, each with distinct built-in roles.

The system categorizes cluster built-in roles into the following types, each defining the extent of permissions for cluster users:

- `Admin`: Full control over the cluster and associated resources.

- `Read-Write`: Permission to read, write, and manage collections and indexes within the cluster.

- `Read-Only`: Viewing rights for most cluster resources, but no creation, modification, or deletion capabilities.

To manage cluster users with various roles, see [Manage Cluster Credentials](./cluster-credentials-console).

<Admonition type="info" icon="📘" title="Notes">

<p></p>
<ul>
<li>These built-in roles are only applicable to serverless and dedicated clusters. Free clusters support only the <code>Read-Write</code> role. For more information on cluster types, see <a href="./select-zilliz-cloud-service-plans">Select the Right Cluster Plan</a>.</li>
</ul>
<p></p>
<ul>
<li>If you encounter an error while using the built-in roles feature with a dedicated cluster, please <a href="https://zilliz.com/contact-sales">contact us</a> for troubleshooting assistance.</li>
</ul>

</Admonition>

## Access levels{#access-levels}

<table>
   <tr>
     <th><p>Platform Role</p></th>
     <th><p>UI Operation</p></th>
     <th><p>API Operation</p></th>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Organization & Project</strong></p></td>
   </tr>
   <tr>
     <td><p>Organization Owner</p></td>
     <td><p>Grants full access to the organization:<br/> - Full access to all projects in the organization;<br/> - Full access to <a href="./payment-billing">payments & billing</a>;<br/> <br/> - Manage <a href="./manage-api-keys">API keys</a>;<br/> <br/> - Manage <a href="./organization-users">organization users</a>;<br/> - Full access to <a href="./metrics-and-alerts">metrics & alerts</a>;<br/> - View <a href="./view-activities">activities</a>;<br/> - Manage <a href="./organization-settings">organization settings</a>;<br/> - Use <a href="./use-recycle-bin">recycle bin</a>.</p></td>
     <td><p><strong>RESTful</strong><br/> - Cloud (<a href="/reference/restful/list-cloud-providers">list cloud providers</a> &amp; <a href="/reference/restful/list-cloud-regions">regions</a>)<br/> - Cluster (<a href="/reference/restful/create-cluster">create</a>, <a href="/reference/restful/list-clusters">list</a>, <a href="/reference/restful/describe-cluster">describe</a>, <a href="/reference/restful/drop-cluster">dop</a>, <a href="/reference/restful/modify-cluster">modify</a>, <a href="/reference/restful/resume-cluster">resume</a>, <a href="/reference/restful/suspend-cluster">suspend</a>, <a href="/reference/restful/create-serverless-cluster">create serverless</a>, <a href="/reference/restful/list-projects">list projects</a>)<br/> - Import (<a href="/reference/restful/import">import</a>, <a href="/reference/restful/get-import-progress">get import progress</a>, <a href="/reference/restful/list-import-jobs">list import jobs</a>)<br/> <br/> - Pipeline (<a href="/reference/restful/describe-pipeline">describe</a>, <a href="/reference/restful/create-pipeline">create</a>, <a href="/reference/restful/list-pipelines">list</a>, <a href="/reference/restful/run-pipeline">run</a>, <a href="/reference/restful/drop-pipeline">drop</a>)<br/> <br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/create-collection">create</a>, <a href="/reference/restful/describe-collection">describe</a>, <a href="/reference/restful/drop-collection">drop</a>)<br/> - Vector (<a href="/reference/restful/delete">delete</a>, <a href="/reference/restful/insert">insert</a>, <a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>, <a href="/reference/restful/upsert">upsert</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - Credential (create, delete, list, update, addUserToRole, selectUser)<br/> - Alias (create, drop, describe, alter, list)<br/> - System (getVersion, checkHealth)<br/> - Collection (create, drop, describe, show, load, release, flush, getFlushState, compaction, getStatistics, rename)<br/> - Partition (create, drop, hasPartition, load, release, show)<br/> - Index (create, drop, getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, insert, delete, get,  query)</p></td>
   </tr>
   <tr>
     <td><p>Project Owner</p></td>
     <td><p>Grants full access to the project:<br/> - Full access to <a href="./cluster">clusters</a> and <a href="./pipelines">pipelines</a> in the project;<br/> - Manage <a href="./project-users">project users</a>;<br/> <br/> - Restricted access to <a href="./manage-api-keys">API keys</a>;<br/> - Access to <a href="./network-and-security">whitelist and private link</a>;<br/> <br/> - Access to <a href="./manage-project-alerts">project alerts</a>.</p></td>
     <td><p><strong>RESTful</strong><br/> - Cloud (<a href="/reference/restful/list-cloud-providers">list cloud providers</a> &amp; <a href="/reference/restful/list-cloud-regions">regions</a>)<br/> - Cluster (<a href="/reference/restful/create-cluster">create</a>, <a href="/reference/restful/list-clusters">list</a>, <a href="/reference/restful/describe-cluster">describe</a>, <a href="/reference/restful/drop-cluster">dop</a>, <a href="/reference/restful/modify-cluster">modify</a>, <a href="/reference/restful/resume-cluster">resume</a>, <a href="/reference/restful/suspend-cluster">suspend</a>, <a href="/reference/restful/create-serverless-cluster">create serverless</a>, <a href="/reference/restful/list-projects">list projects</a>)<br/> - Import (<a href="/reference/restful/import">import</a>, <a href="/reference/restful/get-import-progress">get import progress</a>, <a href="/reference/restful/list-import-jobs">list import jobs</a>)<br/> <br/> - Pipeline (<a href="/reference/restful/describe-pipeline">describe</a>, <a href="/reference/restful/create-pipeline">create</a>, <a href="/reference/restful/list-pipelines">list</a>, <a href="/reference/restful/run-pipeline">run</a>, <a href="/reference/restful/drop-pipeline">drop</a>)<br/> <br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/create-collection">create</a>, <a href="/reference/restful/describe-collection">describe</a>, <a href="/reference/restful/drop-collection">drop</a>)<br/> - Vector (<a href="/reference/restful/delete">delete</a>, <a href="/reference/restful/insert">insert</a>, <a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>, <a href="/reference/restful/upsert">upsert</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - Credential (create, delete, list, update, addUserToRole, selectUser)<br/> - Alias (create, drop, describe, alter, list)<br/> - System (getVersion, checkHealth)<br/> - Collection (create, drop, describe, show, load, release, flush, getFlushState, compaction, getStatistics, rename)<br/> - Partition (create, drop, hasPartition, load, release, show)<br/> - Index (create, drop, getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, insert, delete, get,  query)</p></td>
   </tr>
   <tr>
     <td><p>Project Member</p></td>
     <td><p>Grants read/write access to clusters in the project:<br/> - View clusters and pipelines, but cannot create or manage them;<br/> - Manage <a href="./manage-collections">collections</a> &amp; <a href="./manage-indexes">indexes</a>.</p></td>
     <td><p><strong>RESTful</strong><br/> - Cloud (<a href="/reference/restful/list-cloud-providers">list cloud providers</a> &amp; <a href="/reference/restful/list-cloud-regions">regions</a>)<br/> - Import (<a href="/reference/restful/import">import</a>, <a href="/reference/restful/get-import-progress">get import progress</a>, <a href="/reference/restful/list-import-jobs">list import jobs</a>)<br/> <br/> - Pipeline (<a href="/reference/restful/describe-pipeline">describe</a>, <a href="/reference/restful/create-pipeline">create</a>, <a href="/reference/restful/list-pipelines">list</a>, <a href="/reference/restful/run-pipeline">run</a>, <a href="/reference/restful/drop-pipeline">drop</a>)<br/> <br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/create-collection">create</a>, <a href="/reference/restful/describe-collection">describe</a>, <a href="/reference/restful/drop-collection">drop</a>)<br/> - Vector (<a href="/reference/restful/delete">delete</a>, <a href="/reference/restful/insert">insert</a>, <a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>, <a href="/reference/restful/upsert">upsert</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - Alias (create, drop, describe, alter, list)<br/> - System (getVersion, checkHealth)<br/> - Collection (create, drop, describe, show, load, release, flush, getFlushState, compaction, getStatistics, rename)<br/> - Partition (create, drop, hasPartition, load, release, show)<br/> - Index (create, drop, getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, insert, delete, get,  query)</p></td>
   </tr>
   <tr>
     <td colspan="3"><p><strong>Cluster Built-in Role</strong></p></td>
   </tr>
   <tr>
     <td><p>Admin (<code>db_admin</code>)</p></td>
     <td><p>Grants full access to the cluster.</p></td>
     <td><p><strong>RESTful</strong><br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/create-collection">create</a>, <a href="/reference/restful/describe-collection">describe</a>, <a href="/reference/restful/drop-collection">drop</a>)<br/> - Vector (<a href="/reference/restful/delete">delete</a>, <a href="/reference/restful/insert">insert</a>, <a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>, <a href="/reference/restful/upsert">upsert</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - Credential (create, delete, list, update, addUserToRole, selectUser)<br/> - Alias (create, drop, describe, alter, list)<br/> - System (getVersion, checkHealth)<br/> - Collection (create, drop, describe, show, load, release, flush, getFlushState, compaction, getStatistics, rename)<br/> - Partition (create, drop, hasPartition, load, release, show)<br/> - Index (create, drop, getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, insert, delete, get,  query)</p></td>
   </tr>
   <tr>
     <td><p>Read-Write (<code>db_rw</code>)</p></td>
     <td><p>Grants read/write access to the cluster.</p></td>
     <td><p><strong>RESTful</strong><br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/create-collection">create</a>, <a href="/reference/restful/describe-collection">describe</a>, <a href="/reference/restful/drop-collection">drop</a>)<br/> - Vector (<a href="/reference/restful/delete">delete</a>, <a href="/reference/restful/insert">insert</a>, <a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>, <a href="/reference/restful/upsert">upsert</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - System (getVersion, checkHealth)<br/> - Alias (create, drop, describe, alter, list)<br/> - Collection (create, drop, describe, show, load, release, flush, getFlushState, rename)<br/> - Partition (create, drop, hasPartition, load, release, show)<br/> - Index (create, drop, getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, insert, delete, get,  query)</p></td>
   </tr>
   <tr>
     <td><p>Read-Only (<code>db_ro</code>)</p></td>
     <td><p>Grants read-only access to the cluster.</p></td>
     <td><p><strong>RESTful</strong><br/> - Collection (<a href="/reference/restful/list-collections">list</a>, <a href="/reference/restful/describe-collection">describe</a>)<br/> - Vector (<a href="/reference/restful/search">search</a>, <a href="/reference/restful/query">query</a>, <a href="/reference/restful/get">get</a>)<br/> <strong>SDKs (Python, Java, Go, Node.js)</strong><br/> - Alias (describe, list)<br/> - System (getVersion, checkHealth)<br/> - Collection (describe, show, load)<br/> - Partition (hasPartition, show)<br/> - Index (getIndexState, getIndexBuildProgress, describeIndex)<br/> - Vector (search, get,  query)</p></td>
   </tr>
</table>

## Related topics{#related-topics}

- [A Panorama View](./resource-hierarchy)

- [Manage Organizations and Members](./organizations)

- [Manage Projects and Collaborators](./project-access)

