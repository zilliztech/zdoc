---
title: "Okta (OIDC) | BYOC"
slug: /openid-connect
sidebar_label: "Okta (OIDC)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Okta using the OpenID Connect (OIDC) protocol. | BYOC"
type: origin
token: OQ2ZwpH9ki5EZIkwK21cghexnOh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta (OIDC)

This topic describes how to configure single sign-on (SSO) with Okta using the OpenID Connect (OIDC) protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and Okta acts as the Identity Provider (IdP). The following digram illustrates the necessary steps in Zilliz Cloud and Okta console.

![EfRWwnbKNhcXEwbL7EBcB66inrd](https://zdoc-images.s3.us-west-2.amazonaws.com/EfRWwnbKNhcXEwbL7EBcB66inrd.png)

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You have Admin access to the Okta console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

As the SP, Zilliz Cloud provides the **Single sign-on URL** required when setting up your OIDC app in Okta.

<Supademo id="cme89wf1w3eaoh3pytd3723ao" title="Step 1: Access service provider details in Zilliz Cloud console" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Okta (OIDC)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy your **Single sign-on URL**. It will be required in [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console) when creating an OIDC app in Okta console.

1. Once that's done, proceed to [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console).

### Step 2: Set up an OIDC app in Okta console\{#step-2-set-up-an-oidc-app-in-okta-console}

In this step, you configure Okta (the IdP) with the SP details obtained from Zilliz Cloud.

<Supademo id="cme8abl5c3ei3h3pywbc9z740" title="Step 1: Create SAML App in Okta Console" />

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **OIDC - OpenID Connect** as the sign-in method, then select **Web Application** as the application type. Click **Next**.

1. Set up the new Web App integration with the following settings: 

    - **App integration name**: Customize your app integration name (e.g. **zilliz**).

    - **Sign-in redirect URIs**: Paste the **Single sign-on URL** you copied from Zilliz Cloud console in [Step 1](./openid-connect#step-1-access-sp-details-in-zilliz-cloud-console) here.

    - **Controlled access**: Choose **Skip group assignment for now** unless you want to set up specific group access.

1. Click **Save**. Then, you'll be redirected to the app details page.

1. On the app details page, get the following information:

    - **Client ID**

    - **Client Secret**

    - **Okta domain**

    These values will be required in Zilliz Cloud console in [Step 3](./openid-connect#step-3-configure-idp-settings-in-zilliz-cloud-console).

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

In this step, you provide Okta’s IdP details back to Zilliz Cloud to complete the OIDC trust relationship.

<Supademo id="cme8af32q3elth3pyaygkdnmo" title="Step 3: Configure Okta settings in Zilliz Cloud console" />

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the **Configure Single Sign-On (SSO)** dialog box, configure the following:

    - **Okta Domain**: Paste the **Okta domain** you copied from Okta console in [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console).

    - **Client ID**: Paste the **Client ID** you copied from Okta console in [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console).

    - **Client Secret**: Paste the **Client Secret** you copied from Okta console in [Step 2](./openid-connect#step-2-set-up-an-oidc-app-in-okta-console).

1. Once that's done, click **Save**. Then, click **OK**.

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign OIDC app to users\{#task-1-assign-oidc-app-to-users}

<Supademo id="cme8ahjdm3epjh3pyg6a3k93k" title="Task 1: Assign OIDC app to users" />

Before users can access Zilliz Cloud through SSO, you need to assign the OIDC app to them:

1. On the app details page of the [Okta Admin console](https://login.okta.com/), click **Assignments**.

1. Choose **Assign** > **Assign to People**.

1. Assign the OIDC app to the user and save the changes.

1. Click **Save** **and** **Go Back**. Then, click **Done**.

Repeat for all users as needed. See [Okta documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) for more.

### Task 2: Invite users to your project\{#task-2-invite-users-to-your-project}

When users log in to Zilliz Cloud via SSO for the first time, they are registered as an **Organization Member** but have no access to any project by default.

- The **Organization Owner** must invite them into the appropriate projects.

- For step-by-step instructions on how to invite users to a project, refer to [Manage Project Users](./project-users#invite-a-user-to-a-project).

After being invited to a project, the **Organization** **Owner** can share the Zilliz Cloud login URL with enterprise users so they can sign in through SSO.

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://zilliz.com/contact-sales).

## FAQ\{#faq}

### What role is assigned to users who log in via SSO for the first time?\{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

New users who do not already have a Zilliz Cloud account will be automatically created upon their first SSO login. These users are assigned the **Organization Member** role by default. You can modify their roles later in the Zilliz Cloud console. For detailed steps, refer to [Manage Project Users](./project-users#edit-a-collaborators-role-or-remove-a-collaborator).

### How do users access projects after SSO login?\{#how-do-users-access-projects-after-sso-login}

After logging in via SSO, users will have **Organization Member** role by default. To access specific projects, an **Organization Owner** or **Project Admin** must invite them to projects. For detailed steps, see [Manage Project Users](./project-users).

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?\{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

If the user already exists in your Zilliz Cloud organization (based on their email), they will retain their original role and permissions when logging in via SSO. The system matches users by email address and does not overwrite existing accounts.

### Can I configure multiple SSO providers for the same organization?\{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Currently, each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.