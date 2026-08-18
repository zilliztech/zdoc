---
title: "Configure SCIM Provisioning with Microsoft Entra | Cloud"
slug: /configure-scim-provisioning-with-microsoft-entra
sidebar_label: "Configure SCIM Provisioning with Microsoft Entra"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide describes how to configure SCIM provisioning from Microsoft Entra to Zilliz Cloud. With SCIM provisioning, Microsoft Entra can provision organization users to your Zilliz Cloud organization. | Cloud"
type: origin
token: TqR1wKJMni2xCkkwNf4c52eKnKd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Configure SCIM Provisioning with Microsoft Entra

This guide describes how to configure SCIM provisioning from Microsoft Entra to Zilliz Cloud. With SCIM provisioning, Microsoft Entra can provision organization users to your Zilliz Cloud organization.

If your organization already uses Microsoft Entra for SSO, keep the existing SSO application for user sign-in. Configure SCIM provisioning separately in a dedicated enterprise application. For an overview of how SSO, SCIM, synced groups, and Access Control work together, see [SCIM Provisioning](/docs/scim-provisioning).

The following diagram shows the setup flow between Zilliz Cloud and Microsoft Entra.

![BBAQwwUhEhlqlSbaHaMc03binef](https://zdoc-images.s3.us-west-2.amazonaws.com/BBAQwwUhEhlqlSbaHaMc03binef.png)

## Before you start\{#before-you-start}

- You have configured and verified SSO for your Zilliz Cloud organization.

- You are the **Organization Owner** of the Zilliz Cloud organization where you want to configure SCIM provisioning.

- You can create or manage an enterprise application and its provisioning configuration in Microsoft Entra.

## Step 1: Get the SCIM Base URL and API Token in Zilliz Cloud\{#step-1-get-the-scim-base-url-and-api-token-in-zilliz-cloud}

In Zilliz Cloud, SCIM provisioning settings provide the connection details that Microsoft Entra needs to call the Zilliz Cloud SCIM API.

<Supademo id="cmryemjll4vptqmblonpseggo" title=""  />

<Procedures>

1. In the left-side navigation pane, click **Settings**.

1. Scroll to **System for Cross-domain Identity Management (SCIM)**, then click **Enable**.

1. In the **Enable SCIM** dialog, click **Enable**.

1. Copy the **SCIM Base URL** and **SCIM API Token**.

</Procedures>

You will use these values when configuring provisioning in Microsoft Entra. Treat the SCIM API Token as a secret.

## Step 2: Create a SCIM app in Microsoft Entra\{#step-2-create-a-scim-app-in-microsoft-entra}

Create a non-gallery enterprise application for SCIM provisioning. If your organization already has a dedicated Zilliz Cloud SCIM enterprise application, select that application instead of creating another one. For Microsoft's general non-gallery SCIM workflow, see [Develop and plan provisioning for a SCIM endpoint](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/use-scim-to-provision-users-and-groups).

<Supademo id="cms5susfa2kc0qmqq7cotjnk4" title=""  />

<Procedures>

1. In the Microsoft Entra admin center, go to **Entra ID** > **Enterprise apps**.

1. Click **+ New application**, then click **+ Create your own application**.

1. Enter a name for the application.

1. Select **Integrate any other application you don't find in the gallery**, then click **Create**.

</Procedures>

## Step 3: Configure SCIM provisioning in Microsoft Entra\{#step-3-configure-scim-provisioning-in-microsoft-entra}

Configure the enterprise application with the SCIM credentials from Zilliz Cloud. Microsoft documents **Tenant URL**, **Secret Token**, and **Test Connection** for non-gallery SCIM provisioning. For the broader workflow, see [Configure automatic user provisioning](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/configure-automatic-user-provisioning-portal).

<Supademo id="cms5sxpdo2kf0qmqqll9p00kk" title=""  />

<Procedures>

1. In the enterprise application, open **Provisioning**, then click **+ New configuration**.

1. In **Tenant URL**, enter the **SCIM Base URL** from Zilliz Cloud.

1. In **Secret Token**, enter the **SCIM API Token** from Zilliz Cloud.

1. Click **Test Connection**.

1. After the connection test succeeds, click **Create**.

</Procedures>

The SCIM API Token is used as a bearer token. Review the default mappings and provisioning scope before starting provisioning. Do not add or remap attributes solely by analogy with another SCIM integration. For mapping concepts, see [Customize application attributes](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/customize-application-attributes).

## Step 4: Provision users and groups from Microsoft Entra\{#step-4-provision-users-and-groups-from-microsoft-entra}

Assign the users or groups that you want to provision, then enable provisioning. The following procedure uses a group as an example; select target groups or individual users based on your provisioning needs. For Microsoft's assignment workflow and licensing requirements, see [Assign users and groups to an application](https://learn.microsoft.com/en-us/entra/identity/enterprise-apps/assign-user-or-group-access-portal).

<Supademo id="cms5vvryb2nzjqmqqfkrz8sp1" title=""  />

<Procedures>

1. In the enterprise application, open **Users and groups**.

1. Click **Add user/group**, then open the member selector.

1. Open the **Groups** tab, select the target group, click **Select**, then click **Assign**.

1. Return to **Provisioning**, then set **Provisioning Status** to **On**.

1. Click **Save**.

</Procedures>

After you enable provisioning, open **Provisioning logs** as needed to monitor operations or troubleshoot failures. Group-based application assignment requires Microsoft Entra ID P1 or P2. For provisioning cycles, scope, and logs, see [Understand how application provisioning works](https://learn.microsoft.com/en-us/entra/identity/app-provisioning/how-provisioning-works).

## Step 5: Verify provisioning in Zilliz Cloud\{#step-5-verify-provisioning-in-zilliz-cloud}

After Microsoft Entra runs the provisioning job, verify the expected users or synced groups in Zilliz Cloud. The following procedure uses a synced group as an example.

<Supademo id="cms5wi4fy2ozgqmqqcqcsf5w9" title=""  />

<Procedures>

1. In the Zilliz Cloud organization, click **Access Control**, then open the **Groups** tab.

1. Select the synced group and review its details.

</Procedures>

SCIM synchronizes identity data only. Assign organization and project roles separately in Zilliz Cloud. If you assigned individual users instead of a group, verify them in the organization member view. The recorded example confirms that a provisioned group is visible in Zilliz Cloud; it does not verify every later group lifecycle operation.

## Troubleshooting\{#troubleshooting}

| Issue | What to check |
| --- | --- |
| The connection test fails | Verify that **Tenant URL** contains the complete Zilliz **SCIM Base URL** and **Secret Token** contains the current **SCIM API Token**. Recopy both values from Zilliz Cloud. |
| An assigned user or synced group does not appear in Zilliz Cloud | Verify the assignment, provisioning scope, mappings, job status, and the exact user or group operation result in **Provisioning logs**. |
| Provisioning reports a mapping, scope, or status error | Review the default mappings, matching properties, selected scope, and job status. Use Microsoft's provisioning and attribute-mapping documentation before changing the configuration. |
| A group cannot be assigned | Confirm that the tenant has Microsoft Entra ID P1 or P2. Individual-user assignment can still be tested separately. |
| Group assignment succeeds but no synced group appears | Review **Provisioning logs** for the group and membership operations, confirm the assignment and provisioning scope, and verify that **Provisioning Status** is **On**. |
