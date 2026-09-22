---
title: "Enforce SSO in Your Organization | BYOC"
slug: /enforce-sso-in-your-organization
sidebar_label: "Enforce SSO in Your Organization"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "If your organization requires members to sign in through its identity provider (IdP), configuring single sign-on (SSO) alone does not meet that requirement. Members can still log in to Zilliz Cloud with email/password or third-party accounts such as Google and GitHub. | BYOC"
type: origin
token: MvE5wUlFli3gJOk0MkeclZCqnib
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Enforce SSO in Your Organization

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only with the Enterprise plan or higher, and BYOC deployments.

</FeatureNote>

If your organization requires members to sign in through its identity provider (IdP), configuring single sign-on (SSO) alone does not meet that requirement. Members can still log in to Zilliz Cloud with email/password or third-party accounts such as Google and GitHub.

To require SSO for console access, enable SSO enforcement. You can apply this requirement to all members, including Organization Owners, or allow Organization Owners to use other login methods.

## Owner exemption\{#owner-exemption}

SSO enforcement lets you decide whether Organization Owners must also use SSO. Allowing Owner exemption provides an alternative way for owners to access the console and manage the organization if SSO login fails.

Choose the policy that meets your organization's authentication requirements:

| Policy | What it means |
| --- | --- |
| **Allow Owner exemption** (default) | Organization Owners can use email/password or third-party accounts to log in. This helps them access the console to resolve SSO configuration issues. Other members must use SSO. |
| **Require SSO for everyone** | All members, including Organization Owners, must authenticate through your IdP. Use this policy when your organization requires SSO without an Owner exception. |

<Admonition type="warning" title="Warning">

Before requiring SSO for Organization Owners, verify that you can successfully log in through SSO. If an SSO configuration error prevents everyone from logging in, you must contact support to restore access.

</Admonition>

If your organization already had SSO enforcement enabled, Owner exemption remains enabled after this update. Organization Owners are not automatically required to switch to SSO.

If you belong to multiple organizations, being exempt in one does not necessarily let you log in without SSO. You must still use SSO if another organization enforces it and you are not an Organization Owner there. The same applies if that organization does not allow Owner exemption.

<details>

<summary>How Owner exemption works across multiple organizations</summary>

You can log in without SSO only if, in **every organization with SSO enforcement enabled** that you belong to:

- You are an **Organization Owner**.

- The organization allows Organization Owners to log in without SSO.

If either condition is not met, you must use SSO, regardless of which organization you intend to access.

| Your roles and organization settings | Can you log in without SSO? |
| --- | --- |
| You are an Owner in every SSO-enforced organization, and all of them allow Owner exemption. | Yes |
| You are a regular member in at least one SSO-enforced organization. | No |
| You are an Owner in every SSO-enforced organization, but at least one does not allow Owner exemption. | No |

Organizations without SSO enforcement do not add this restriction. Being an Owner in such an organization does not exempt you from another organization's policy.

These rules determine whether you can use a non-SSO login. They do not introduce a requirement to sign in separately through each organization's SSO.

</details>

## Before you start\{#before-you-start}

Before enabling SSO enforcement, complete the following checks:

- Ensure you are an **Organization Owner** in the target organization.

- Configure and enable SSO for your organization, then verify that SSO login succeeds. For setup instructions, refer to the configuration guide for your IdP, such as [Okta (OIDC)](./openid-connect).

- Assign all intended members to the SSO application in your IdP and confirm that they can successfully log in through SSO. Before turning off Owner exemption, verify that **you can also log in through SSO**.

- Prepare to provision organization members through your IdP. Enabling enforcement disables direct organization member invitations. Project-level invitations are limited to existing organization members.

- If you require multi-factor authentication (MFA), configure it in your IdP. Any [MFA](./multi-factor-auth) enabled for your organization on Zilliz Cloud is automatically disabled when you enable SSO enforcement.

## Enable SSO enforcement\{#enable-sso-enforcement}

<Admonition type="warning" title="Warning">

Enabling SSO enforcement immediately invalidates all active sessions for non-exempt members, including sessions authenticated through SSO. Affected members must log in again through SSO. If you turn off Owner exemption, this also applies to Organization Owners, including you.

</Admonition>

<Supademo id="cml4tlban34cozsadvi68n666" title=""  />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to enable SSO enforcement.

1. In the left-side navigation pane, click **Settings**.

1. Find the **Single Sign-On (SSO)** section. Ensure SSO is configured and enabled.

1. Turn on **Enforce SSO Login**. The **Enable SSO Enforcement** dialog opens.

1. Set **Allow Organization Owners to log in without SSO**. Leave it on to allow Owner exemption, subject to other organizations' policies. Turn it off to require SSO for everyone, including Organization Owners.

1. Review the impact before proceeding: all non-exempt members will be logged out, even if they logged in through SSO. If you turned off Owner exemption, you will also be logged out. Click **Enable** to apply the setting.

</Procedures>

SSO enforcement is now enabled with the Owner exemption setting you selected. Non-exempt members must log in through SSO. Zilliz Cloud sends Organization Owners an email containing the **SSO Login URL**.

## Disable SSO enforcement\{#disable-sso-enforcement}

<Procedures>

1. In the Zilliz Cloud console, navigate to **Settings** and find the **Single Sign-On (SSO)** section.

1. Turn off the **Enforce SSO Login** toggle.

1. Click to confirm.

</Procedures>

Disabling SSO enforcement removes this organization's requirement to use SSO. Members can use their existing non-SSO login methods only if no other organization they belong to requires them to use SSO under the Owner exemption rules.

## FAQ\{#faq}

**What should I do if I cannot log in after enabling SSO enforcement?**

Use your organization's SSO Login URL to log in again. Organization Owners receive this URL by email when enforcement is enabled.

If Owner exemption is turned off and an incorrect IdP configuration prevents everyone from logging in, contact support for assistance restoring access. Organization Owners cannot bypass enforcement with email/password or third-party accounts in this case.