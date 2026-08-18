---
title: "SCIM Provisioning Overview | Cloud"
slug: /scim-provisioning-overview
sidebar_label: "SCIM Provisioning Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In an enterprise environment, the list of people who should access Zilliz Cloud changes constantly. New employees join, users move between teams, and others leave the company. Without automated provisioning, organization administrators need to keep Zilliz Cloud aligned with these changes manually by inviting users, updating user records, maintaining group membership, and making sure access assignments still match the current team structure. | Cloud"
type: origin
token: KhJhw2lOBirGhekK8jbcZkb2nVg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# SCIM Provisioning Overview

In an enterprise environment, the list of people who should access Zilliz Cloud changes constantly. New employees join, users move between teams, and others leave the company. Without automated provisioning, organization administrators need to keep Zilliz Cloud aligned with these changes manually by inviting users, updating user records, maintaining group membership, and making sure access assignments still match the current team structure.

Single sign-on (SSO) lets users sign in to Zilliz Cloud with the identity managed by your identity provider (IdP), so they do not need a separate Zilliz Cloud password or a separate sign-in identity. However, authentication is only one part of identity management. SSO verifies who a user is when they sign in, but it does not keep the users, groups, or group memberships in Zilliz Cloud synchronized with the directory data managed in your IdP.

System for Cross-domain Identity Management (SCIM) provisioning fills this gap. With SCIM, your IdP provisions users, groups, and group memberships to Zilliz Cloud, so Zilliz Cloud can represent the identities and teams managed in your IdP. Synced groups can then be used as principals in Access Control, where Zilliz Cloud administrators assign roles to groups instead of managing access user by user.

## About SCIM provisioning in Zilliz Cloud\{#about-scim-provisioning-in-zilliz-cloud}

SCIM provisioning in Zilliz Cloud is an identity synchronization workflow between your IdP and your Zilliz Cloud organization. Your IdP acts as the SCIM client and remains the source of truth for users, groups, and group memberships. Zilliz Cloud acts as the SCIM 2.0 server, receives provisioning requests from the IdP, and represents the synced identities in your organization.

![BVg3wxmA7h6SqrbqOc2cUoiHnac](https://zdoc-images.s3.us-west-2.amazonaws.com/BVg3wxmA7h6SqrbqOc2cUoiHnac.png)

The diagram shows how IdP-managed groups, SCIM provisioning, SSO, and Zilliz Cloud Access Control work together:

1. IdP administrators manage users, groups, and group memberships in the IdP, such as Data Eng, Analytics, and Finance groups.

1. SCIM provisioning syncs those users, groups, and group memberships from the IdP to your Zilliz Cloud organization.

1. Synced groups appear in Zilliz Cloud as identities from the IdP. The groups and memberships remain managed in the IdP.

1. Users still sign in to Zilliz Cloud through SSO. SSO authenticates user sign-in, while SCIM keeps identity records in sync.

1. Zilliz Cloud administrators assign roles to synced groups in Access Control. For example, Data Eng can be assigned the Data Operator role, Analytics can be assigned the Data Viewer role, and Finance can be assigned the Billing Admin role.

SCIM syncs identity data only: users, groups, and group memberships. It does not assign Zilliz Cloud roles or permissions. Role assignments are managed in Zilliz Cloud Access Control, where synced users or groups can be granted organization roles or project roles. SSO continues to authenticate users when they sign in.

Use SCIM provisioning when your organization already manages users and teams centrally in an IdP and you want Zilliz Cloud to follow that structure. In this model, administrators manage the lifecycle of users and groups in the IdP, and the IdP pushes those changes to Zilliz Cloud through SCIM.

This is useful when you want to:

- Provision users from a central IdP instead of inviting them manually.

- Sync IdP groups and group memberships to Zilliz Cloud.

- Use synced groups as access control principals.

- Reduce manual cleanup when users leave your organization or move to a different team.

- Keep Zilliz Cloud identity data aligned with the directory data maintained by your IT team.

## What SCIM syncs from your IdP to Zilliz Cloud\{#what-scim-syncs-from-your-idp-to-zilliz-cloud}

SCIM provisioning keeps identity data in Zilliz Cloud aligned with your IdP. It syncs users, groups, and group memberships, but it does not authenticate users or assign Zilliz Cloud roles. Authentication remains handled by your sign-in method, such as SSO. Role assignments remain managed in Zilliz Cloud Access Control.

| Item | What SCIM syncs to Zilliz Cloud | Where to manage it |
| --- | --- | --- |
| Users | SCIM provisions users assigned in the IdP to Zilliz Cloud and updates their user records based on IdP changes. | Manage which users are provisioned in the IdP. |
| Groups | SCIM syncs group records from the IdP to Zilliz Cloud. Synced groups are read-only in Zilliz Cloud. | Manage group names and group lifecycle in the IdP. |
| Group memberships | SCIM syncs which users belong to each synced group. | Add or remove users from groups in the IdP. |
| Role assignments | SCIM does not sync roles or permissions. It makes synced users and groups available as principals in Access Control. | Assign organization roles and project roles in Zilliz Cloud Access Control. |

Nested groups are not supported. A synced group can contain users, but not other groups.

## Supported identity providers\{#supported-identity-providers}

Zilliz Cloud supports SCIM provisioning for the same IdPs documented for SSO:

| Identity provider | Configuration guide |
| --- | --- |
| Okta | Configure SCIM provisioning with Okta |
| Google Workspace | Configure SCIM provisioning with Google Workspace |
| Microsoft Entra | Configure SCIM provisioning with Microsoft Entra |

Each IdP has its own configuration workflow. Use the setup guide for your IdP when you are ready to configure SCIM provisioning.