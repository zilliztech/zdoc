---
title: "Manage Project Users | Cloud"
slug: /project-users
sidebar_label: "Project Users"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, you can invite users to projects and assign them roles based on their job functions. These roles determine the user's access to projects and the operations they can perform. | Cloud"
type: origin
token: PZ4uwwgUfio5OikY0Ecc5nrunFf
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - project users
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval

---

import Admonition from '@theme/Admonition';


# Manage Project Users

In Zilliz Cloud, you can invite users to projects and assign them roles based on their job functions. These roles determine the user's access to projects and the operations they can perform.

This topic describes how to manage project users.

## Invite a user to a project\{#invite-a-user-to-a-project}

To invite a user to join a project, you must be an **Organization Owner** or a **Project Admin**.

When inviting a user to a project, you need to grant a role to the user which defines the privileges to perform certain operations within this project. 

To invite users, enter the email addresses of the users you wish to invite. Then select the project role you wish to grant to the new project users. 

### Project roles\{#project-roles}

Zilliz Cloud provides three project roles. These roles cannot be modified or deleted.

- **Project Admin**: A Project Admin role has full privileges to manage a project and all its resources (clusters, databases, collections).

    The following table lists the corresponding UI and API privileges of each project role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>Manage <a href="./cluster">clusters</a> in the project</p></li><li><p>Manage <a href="./volume-explained">volumes</a> in the project</p></li><li><p>Manage <a href="./collection">collections</a> &amp; <a href="./manage-indexes">indexes</a></p></li><li><p>Manage <a href="./project-users">project users</a></p></li><li><p>Manage <a href="./network-and-security">IP access list and private links</a></p></li><li><p>Manage <a href="./manage-project-alerts">project alerts</a></p></li><li><p>Manage <a href="./backup-and-restore">backups</a></p></li><li><p>Manage data <a href="./migrations">migrations</a></p></li><li><p>Manage <a href="./job-center">project jobs</a></p></li><li><p>Manage integrations</p></li><li><p>Plus all <a href="./cluster-roles#built-in-cluster-roles">Cluster Admin</a> privileges </p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">All cloud meta operations</a></p></li><li><p><a href="/reference/restful/cluster-operations-v2">All cluster operations</a></p></li><li><p><a href="/reference/restful/volume-operations-v2">All volume operations</a></p></li><li><p><a href="/reference/restful/import-operations-v2">All import operations</a></p></li><li><p><a href="/reference/restful/backup-and-restore-v2">All backup & restore operations</a></p></li><li><p><a href="/reference/restful/cloud-migration-v2">All cloud migration operations</a></p></li><li><p><a href="/reference/restful/cloud-job-v2">All cloud job operations</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">All collection operations</a></p></li><li><p><a href="/reference/restful/index-operations-v2">All index operations</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">All partition operations</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">All vector operations</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">All alias operations</a></p></li><li><p><a href="/reference/restful/role-operations-v2">All role operations</a></p></li><li><p><a href="/reference/restful/user-operations-v2">All user operations</a></p></li></ul></td>
       </tr>
    </table>

- **Project Read-Write**: A Project Read-Write role has the privileges to view a project and manage its resources (clusters, databases, collections).

    The following table lists the corresponding UI and API privileges of each project role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>View <a href="./cluster">clusters</a> in the project and cannot create and manage them</p></li><li><p>View <a href="./volume-explained">volumes</a> in the project and cannot create and manage them</p></li><li><p>Delete files/folders from a volume</p></li><li><p>Manage <a href="./collection">collections</a> &amp; <a href="./manage-indexes">indexes</a></p></li><li><p>View <a href="null">backups</a>, but cannot create or restore from a backup file</p></li><li><p>View <a href="./job-center">project jobs</a>, but cannot cancel jobs or retry failed jobs</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">All cloud meta operations</a></p></li><li><p>Part of cluster operations</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>Part of volume operations</p><ul><li><a href="/reference/restful/list-volumes-v2">List Volumes</a></li></ul></li><li><p><a href="/reference/restful/import-operations-v2">All import operations</a></p></li><li><p>Part of backup &amp; restore operations</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">All cloud job operations</a></p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/collection-operations-v2">All collection operations</a></p></li><li><p><a href="/reference/restful/index-operations-v2">All index operations</a></p></li><li><p><a href="/reference/restful/partition-operations-v2">All partition operations</a></p></li><li><p><a href="/reference/restful/vector-operations-v2">All vector operations</a></p></li><li><p><a href="/reference/restful/alias-operations-v2">All alias operations</a></p></li></ul></td>
       </tr>
    </table>

- **Project Read-Only**: A Project Read-Only role has the privileges to view a project and its resources (clusters, databases, collections).

    The following table lists the corresponding UI and API privileges of each project role.

    <table>
       <tr>
         <th><p><strong>UI Privileges</strong></p></th>
         <th><p><strong>Control Plane RESTful API (V2) Privileges</strong></p></th>
         <th><p><strong>Data Plane RESTful API (V2) Privileges</strong></p></th>
       </tr>
       <tr>
         <td><ul><li><p>View <a href="./cluster">clusters</a> in the project and cannot create and manage them</p></li><li><p>View <a href="./volume-explained">volumes</a> in the project and cannot create and manage them</p></li><li><p>View <a href="./collection">collections</a> &amp; <a href="./manage-indexes">indexes</a> only</p></li><li><p>View <a href="null">backups</a>, but cannot create or restore from a backup file</p></li><li><p>View <a href="./job-center">project jobs</a>, but cannot cancel jobs or retry failed jobs</p></li></ul></td>
         <td><ul><li><p><a href="/reference/restful/cloud-meta-v2">All cloud meta operations</a></p></li><li><p>Part of cluster operations</p><ul><li><p><a href="/reference/restful/list-projects-v2">List Projects</a></p></li><li><p><a href="/reference/restful/list-clusters-v2">List Clusters</a></p></li><li><p><a href="/reference/restful/describe-cluster-v2">Describe Cluster</a></p></li><li><p><a href="/reference/restful/query-cluster-metrics-v2">Query Cluster Metrics</a></p></li><li><p><a href="/docs/prometheus-monitoring">Export Metrics</a></p></li></ul></li><li><p>Part of volume operations</p><ul><li><a href="/reference/restful/list-volumes-v2">List Volumes</a></li></ul></li><li><p>Part of import operations</p><ul><li><p><a href="/reference/restful/get-import-job-progress-v2">Get Import Job Progress</a></p></li><li><p><a href="/reference/restful/list-import-jobs-v2">List Import Jobs </a></p></li></ul></li><li><p>Part of backup &amp; restore operations</p><ul><li><p><a href="/reference/restful/list-backups-v2">List Backups</a></p></li><li><p><a href="/reference/restful/describe-backup-v2">Describe Backup</a></p></li><li><p><a href="/reference/restful/get-backup-policy-v2">Get Backup Policy</a></p></li></ul></li><li><p><a href="/reference/restful/cloud-job-v2">All cloud job operations</a></p></li></ul></td>
         <td><ul><li><p>Part of collection operations</p><ul><li><p><a href="/reference/restful/describe-collection-v2">Describe Collection</a></p></li><li><p><a href="/reference/restful/get-collection-load-state-v2">Get Collection Load State</a></p></li><li><p><a href="/reference/restful/get-collection-stats-v2">Get Collection Stats</a></p></li><li><p><a href="/reference/restful/has-collection-v2">Has Collection</a></p></li><li><p><a href="/reference/restful/list-collections-v2">List Collections</a></p></li></ul></li><li><p>Part of index operations</p><ul><li><p><a href="/reference/restful/describe-index-v2">Describe Index</a></p></li><li><p><a href="/reference/restful/list-indexes-v2">List Indexes</a></p></li></ul></li><li><p>Part of partition operations</p><ul><li><p><a href="/reference/restful/get-partition-statistics-v2">Get Partition Statistics</a></p></li><li><p><a href="/reference/restful/has-partition-v2">Has Partition</a></p></li><li><p><a href="/reference/restful/list-partitions-v2">List Partitions</a></p></li></ul></li><li><p>Part of alias operations</p><ul><li><p><a href="/reference/restful/describe-alias-v2">Describe Alias</a></p></li><li><p><a href="/reference/restful/list-aliases-v2">List Aliases</a></p></li></ul></li></ul></td>
       </tr>
    </table>

The invitees will receive an invitation via email, which must be accepted within 48 hours to join the project. Alternatively, you can also copy the invitation link from the web console and share it with the invitees.

Once the user joins the project, this user automatically becomes an Organization Member in the organization to which the project belongs.

<Admonition type="info" icon="📘" title="Notes">

<p>Each time you can invite one or more users with the same role to join the project.</p>

</Admonition>

![invite-user-to-project](https://zdoc-images.s3.us-west-2.amazonaws.com/invite-user-to-project.png "invite-user-to-project")

## Revoke or resend an invitation\{#revoke-or-resend-an-invitation}

When you invite an existing organization member to a project within the same organization, they automatically gain access to the project without receiving a separate invitation. However, if you invite someone to a project within an organization they are not already a part of, they will receive an invitation to join the organization, which also grants them access to the specified project.

To revoke or resend the invitation, you must be an **Organization Owner** or a **Project Admin**.

<Admonition type="info" icon="📘" title="Notes">

<p>You can revoke or resend an invitation before the user accepts it.</p>

</Admonition>

![revoke-or-cancel-invitation-to-project](https://zdoc-images.s3.us-west-2.amazonaws.com/revoke-or-cancel-invitation-to-project.png "revoke-or-cancel-invitation-to-project")

## Edit a collaborator's role or remove a collaborator\{#edit-a-collaborators-role-or-remove-a-collaborator}

After a user accepts the invitation, the user becomes a project collaborator.

To edit a collaborator's role or remove a project collaborator, you must be an **Organization Owner** or a **Project Admin**.

![edit-user-role-or-remove-project-user](https://zdoc-images.s3.us-west-2.amazonaws.com/edit-user-role-or-remove-project-user.png "edit-user-role-or-remove-project-user")

## Leave a project\{#leave-a-project}

In addition to removing a collaborator from a project, you can also remove yourself by leaving it.

Note that if you are the only admin of a project, you cannot leave it as each project must have at least one Project Admin at all times.

<Admonition type="caution" icon="🚧" title="Warning">

<p>Once you leave a project, your access to the project and associated resources will be revoked.</p>

</Admonition>

![leave-project](https://zdoc-images.s3.us-west-2.amazonaws.com/leave-project.png "leave-project")

