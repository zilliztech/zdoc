---
title: "Enforce SSO in Your Organization | BYOC"
slug: /enforce-sso-in-your-organization
sidebar_label: "Enforce SSO in Your Organization"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "By default, after Single Sign-on (SSO) is configured for an organization, members can still choose to log in with email/password or third-party accounts (Google, GitHub). SSO enforcement removes this flexibility by mandating that all members use SSO as the only login method. | BYOC"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Enforce SSO in Your Organization

By default, after Single Sign-on (SSO) is configured for an organization, members can still choose to log in with email/password or third-party accounts (Google, GitHub). SSO enforcement removes this flexibility by mandating that all members use SSO as the only login method.

This feature is designed for organizations that need to meet enterprise security and compliance requirements, such as centralized authentication, audit controls, and identity governance through an identity provider (IdP).

## Overview\{#overview}

When SSO enforcement is enabled for an organization:

- Members who attempt to log in with email/password or third-party accounts (Google, GitHub) are blocked and prompted to log in via SSO instead.

- If a user belongs to multiple organizations and **any** of those organizations has SSO enforcement enabled, the user must log in via SSO. This applies regardless of which organization the user intends to access.

- Organization Owners are automatically exempt and can still log in with other methods. See [Exemption rules](./enforce-sso-in-your-organization#exemption-rules) for details.

- All active sessions for non-exempt members are immediately invalidated. Affected members are logged out and must re-authenticate via SSO.

- Direct organization member invitations are disabled. You should provision users through your IdP. Project-level invitations are limited to existing organization members only.

- If your organization has [MFA](./multi-factor-auth) enabled on Zilliz Cloud, it will be automatically disabled when SSO enforcement is turned on. If MFA is required, configure it within your IdP instead.

## Before you start\{#before-you-start}

Before enabling SSO enforcement, ensure the following:

- You are an **Organization Owner** in the Zilliz Cloud organization.

- An SSO connection has been **configured and validated** for your organization. For setup instructions, refer to the configuration guide for your IdP (e.g., [Okta (OIDC)](./openid-connect)).

- All intended members have been assigned to the SSO application in your IdP and can successfully log in via SSO.

## Enable SSO enforcement\{#enable-sso-enforcement}

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to enable SSO enforcement.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section. Ensure SSO is already configured and enabled.

1. Locate the **Enforce SSO Login** toggle and turn it on.

1. Click **Confirm**. This will log out all members currently using passwords and disable direct member invitations.

</Procedures>

Once enabled, all organization members (except **Organization Owners**) must log in via SSO. Attempts to log in with email/password or third-party accounts (Google, GitHub) will be blocked.

## Disable SSO enforcement\{#disable-sso-enforcement}

<Procedures>

1. In the Zilliz Cloud console, navigate to **Settings** and find the **Single Sign-On (SSO)** section.

1. Turn off the **Enforce SSO Login** toggle.

1. Click to confirm.

</Procedures>

After SSO enforcement is disabled, members can log in with their original passwords.

## Exemption rules\{#exemption-rules}

Organization Owners are automatically exempt from SSO enforcement. This serves as a break-glass mechanism to ensure that at least one administrator can always access the organization, even if the IdP is misconfigured or unavailable.

The exemption logic follows these rules:

- A user who is an **Organization Owner in every SSO-enforced organization** they belong to is exempt and can log in with any method.

- A user who is an Organization Owner in **some** SSO-enforced organizations but a regular member in **any other** SSO-enforced organization is **not** exempt and must log in via SSO.

The following table illustrates the exemption behavior for users across multiple organizations:

<table>
   <tr>
     <th><p><strong>User</strong></p></th>
     <th><p><strong>Org A (SSO enforced)</strong></p></th>
     <th><p><strong>Org B (SSO enforced)</strong></p></th>
     <th><p><strong>Org C (no enforcement)</strong></p></th>
     <th><p><strong>Exempt?</strong></p></th>
   </tr>
   <tr>
     <td><p>User X</p></td>
     <td><p>Org Owner</p></td>
     <td><p>Org Owner</p></td>
     <td><p>Any role</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p>User Y1</p></td>
     <td><p>Org Owner</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Owner</p></td>
     <td><p><strong>No</strong></p></td>
   </tr>
   <tr>
     <td><p>User Y2</p></td>
     <td><p>Org Owner</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Member</p></td>
     <td><p><strong>No</strong></p></td>
   </tr>
   <tr>
     <td><p>User Y3</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Owner</p></td>
     <td><p><strong>No</strong></p></td>
   </tr>
   <tr>
     <td><p>User Z</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Member</p></td>
     <td><p>Org Member</p></td>
     <td><p>No</p></td>
   </tr>
</table>

In summary, a user is only exempt if they hold the Organization Owner role in **all** organizations that have SSO enforcement enabled. Being an Organization Owner in a non-enforced organization does not grant exemption.