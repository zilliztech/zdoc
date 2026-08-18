---
title: "Manage Platform Roles | Cloud"
slug: /manage-platform-roles
sidebar_label: "Manage Platform Roles"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide introduces the two types of platform roles in Zilliz Cloud organization roles and project roles, and explains how to manage them. | Cloud"
type: origin
token: MyKpwdBxUizDsukJm5Kc8orenbT
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Manage Platform Roles

This guide introduces the two types of platform roles in Zilliz Cloud: organization roles and project roles, and explains how to manage them.

## Manage organization roles\{#manage-organization-roles}

Organization roles control organization-level access. Use organization roles to manage permissions for members, groups, organization settings, billing and subscriptions, security settings, organization alerts, platform audit log visibility, API keys, project management, and recycle bin operations.

<Admonition type="info" icon="📘" title="Note">

Organization roles are for organization-level resources only. They do not define cluster, database, or collection permissions.

</Admonition>

### Predefined organization roles\{#predefined-organization-roles}

The following table explains the 3 predefined organization roles.

| Role | Description | Can be edited? |
| --- | --- | --- |
| Organization Owner | Full organization-level administration, including access control, settings, billing, security, service principals, and project role assignments. | No |
| Billing Admin | Manage billing and subscriptions with read-only access to relevant organization and project context. | No |
| Public | Baseline login-only role automatically granted to every organization member. | No |

## Manage project roles\{#manage-project-roles}

Project roles control access within a specific project. Use project roles to manage project members, cluster lifecycle operations, on-demand compute access, integrations, backups, migrations, alerts, volumes, and project-scoped data access.

<Admonition type="info" icon="📘" title="Note">

A project role belongs to a specific project. When you assign a project role, the assignment applies only to the selected project.

</Admonition>

### Predefined project roles\{#predefined-project-roles}

The following table explains the 4 pre-defined project roles.

| Role | Best for | Typical permissions |
| --- | --- | --- |
| Project Admin | Project owners and platform administrators. | Full project administration, including collaborators, roles, cluster lifecycle, compute, and data access. |
| Cluster Admin | Database administrators and platform engineers. | Cluster administration, such as scaling, backup, cluster operations, and data access. |
| Data Operator | Application teams and data engineers. | Read and write data operations with limited project administration. |
| Data Viewer | Analysts, developers, and read-only applications. | Read-only access for viewing, querying, and search workflows. |

### Custom project roles\{#custom-project-roles}

Create a custom project role when predefined roles do not match your team's responsibilities. A custom project role can combine platform permissions, compute permissions, and data access permissions within the project.

#### Create a custom project role\{#create-a-custom-project-role}

<Procedures>

1. Open the target project.

1. Go to **Access Contro**l.

1. Open the **Project Roles** tab.

1. Click **+ Project Role**.

    ![IlOjwjvJwhqzu4bUqodcngrtnCg](https://zdoc-images.s3.us-west-2.amazonaws.com/IlOjwjvJwhqzu4bUqodcngrtnCg.png)

1. Choose the way you want to create your custom role and click **Next**.

    - **Start from scratch**: Create a fully custom role for maximum flexibility.

    - **Select an existing project role as a template**: Use a predefined role as a starting point and fine-tune its permissions for greater efficiency.

    ![GmXybbNiooO6UOxmFbecv5honGh](https://zdoc-images.s3.us-west-2.amazonaws.com/gmxybbniooo6uoxmfbecv5hongh.png "GmXybbNiooO6UOxmFbecv5honGh")

1. Enter the custom role name and description.

    ![MQf2wvFB2hzZ36bqtqlc8gLqnWg](https://zdoc-images.s3.us-west-2.amazonaws.com/MQf2wvFB2hzZ36bqtqlc8gLqnWg.png)

1. Configure role access and click **Create**. For a full list of the privileges you can add to a custom project role, see [Resource Privilege Reference](./platform-privileges).

    ![Q7qSb7glyojMIfxjpLrcBrX5naf](https://zdoc-images.s3.us-west-2.amazonaws.com/q7qsb7glyojmifxjplrcbrx5naf.png "Q7qSb7glyojMIfxjpLrcBrX5naf")

</Procedures>

#### Edit a custom project role\{#edit-a-custom-project-role}

Edit a custom project role when the permission set needs to change. Changes apply to all users, groups, or customized API keys that are granted the role.

<Procedures>

1. Open the target project.

1. Go to **Access Contro**l.

1. Open the **Project Roles** tab.

1. Find the target custom role, and select **Edit** from the **Actions** menu.

    ![HMbXwwXMvhE92KbOheUcaxIGnud](https://zdoc-images.s3.us-west-2.amazonaws.com/HMbXwwXMvhE92KbOheUcaxIGnud.png)

1. Update the role details or permissions and click **Save**.

    ![JoE9bvCe8ofqBPxIqo9cP1lPnZf](https://zdoc-images.s3.us-west-2.amazonaws.com/joe9bvce8ofqbpxiqo9cp1lpnzf.png "JoE9bvCe8ofqBPxIqo9cP1lPnZf")

</Procedures>

#### Delete a custom project role\{#delete-a-custom-project-role}

<Admonition type="info" icon="📘" title="Note">

You cannot delete a project role that is still assigned to users, groups, or service principals. Remove existing assignments before deleting the role.

</Admonition>

![L4qGwxOVch3VRRbDLdRczHiZnBc](https://zdoc-images.s3.us-west-2.amazonaws.com/L4qGwxOVch3VRRbDLdRczHiZnBc.png)

<Procedures>

1. Open the target project.

1. Go to **Access Contro**l.

1. Open the **Project Roles** tab.

1. Find the target custom role, and select **Delete** from the **Actions** menu.

1. Confirm the deletion.

</Procedures>