---
title: "MFA | BYOC"
slug: /multi-factor-auth
sidebar_label: "MFA"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Authentication verifies your identity when you sign in to Zilliz Cloud. To strengthen this process, Zilliz Cloud supports multi-factor authentication (MFA). | BYOC"
type: origin
token: KHAMwm0HUiU6qdkH2LOcu0FFnug
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - mfa
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# MFA

Authentication verifies your identity when you sign in to Zilliz Cloud. To strengthen this process, Zilliz Cloud supports multi-factor authentication (MFA).

With MFA enabled, you must provide two factors at login:

- Your account password

- A TOTP (time-based one-time password) from an authenticator app (Eg. Google Authenticator, Microsoft Authenticator, etc.)

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud has upgraded MFA for enhanced account security. Starting <strong>November 25, 2025</strong>, email-based MFA is deprecated. Users who previously used email-based MFA must switch to a TOTP authenticator app.</p>

</Admonition>

## Considerations\{#considerations}

- **SSO compatibility**: If your organization has enabled [SSO](./single-sign-on), MFA is managed by your identity provider (IdP). In this case, configure MFA in your IdP account or contact your Organization Owner for assistance.

- **Login method compatibility**: The built-in Zilliz Cloud MFA feature is only available to users who [register](./register-with-zilliz-cloud#registration-options) with an email address and a password.

    - If your account is linked to Google, MFA is controlled by Google. For more information, see [Turn on 2-Step Verification](https://support.google.com/accounts/answer/185839?hl=en&ref_topic=7189195&sjid=2449417013251062800-AP).

    - If your account is linked to GitHub, MFA is controlled by GitHub. For more information, see [Configuring two-factor authentication](https://docs.github.com/en/authentication/securing-your-account-with-two-factor-authentication-2fa/configuring-two-factor-authentication).

## Enable MFA\{#enable-mfa}

The following demo shows how to enable MFA for your own account. The demo uses Microsoft Authenticator as an example, but you can use any TOTP-compatible authenticator app.

<Supademo id="cmi72ns5s4jwob7b4ul2t1zz5?utm_source=link" title=""  />

## Disable MFA\{#disable-mfa}

<Admonition type="info" icon="📘" title="Notes">

<p>If your organization has <a href="./multi-factor-auth#enforce-mfa-for-all-organization-users">MFA enforcement</a> enabled, you cannot disable MFA for your account.</p>

</Admonition>

The following demo shows how to disable MFA for your own account.

<Supademo id="cmi7297fo4jq8b7b448ydxlhk?utm_source=link" title=""  />

## Enforce MFA for all organization users\{#enforce-mfa-for-all-organization-users}

<Admonition type="info" icon="📘" title="Notes">

<p>You must be an Organization Owner to access this feature.</p>
<p>You must have a valid payment method, an <strong>Enterprise</strong> project and a <strong>Dedicated</strong> cluster to use this feature.</p>

</Admonition>

When organization-level MFA enforcement is enabled:

- All users in the organization are required to [set up MFA](./multi-factor-auth#enable-mfa) to sign in.

- Users who have not yet enabled MFA are prompted to set it up the next time they log in.

- Users who do not complete MFA setup will not be able to access the organization.

The following demo shows how to enforce MFA for an organization.

<Supademo id="cmi71danb4is0b7b4eogo3s07?utm_source=link" title=""  />

## Disable MFA enforcement for organization\{#disable-mfa-enforcement-for-organization}

<Admonition type="info" icon="📘" title="Notes">

<p>You must be an Organization Owner to access this feature.</p>

</Admonition>

When organization-level MFA enforcement is disabled:

- Users are no longer required to set up MFA to access the organization.

- Users who have already enabled MFA keep their existing settings and may choose to [turn MFA off](./multi-factor-auth#disable-mfa) for their own accounts.

The following demo shows how to disable MFA enforcement for an organization.

<Supademo id="cmi71q0gk4j6hb7b4xiywity3?utm_source=link" title=""  />

## Troubleshooting\{#troubleshooting}

1. **What can I do if I lose access to my authenticator app?**

    If you cannot complete MFA or log in because you lost access to your authenticator app, contact your Organization Owner or [contact Zilliz Cloud support](http://support.zilliz.com) for assistance.

1. **My account uses SSO. How is MFA handled?**

    If your organization has enabled SSO, MFA is managed by your identity provider (IdP), not by Zilliz Cloud. Configure MFA in your IdP account or contact your Organization Owner.

1. **Why can't I disable MFA?**

    If your organization has enabled MFA enforcement, you cannot turn off MFA for your own account. 

1.  **I’m an Organization Owner and some users are locked out after MFA enforcement. What should I do?**

    Ask those users to complete MFA setup when prompted at login. If they still cannot access the organization, [contact Zilliz Cloud support](http://support.zilliz.com) for assistance.

