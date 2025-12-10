---
title: "Google Workspace (SAML 2.0) | BYOC"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace (SAML 2.0)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Google Workspace using the SAML 2.0 protocol. | BYOC"
type: origin
token: OLAEwETZtitiNFkkA9JcE5YZnXf
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - google
  - workspace
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Google Workspace (SAML 2.0)

This topic describes how to configure single sign-on (SSO) with Google Workspace using the SAML 2.0 protocol.

In this guide, Zilliz Cloud acts as the Service Provider (SP) and Google Workspace acts as the Identity Provider (IdP). The following digram illustrates the necessary steps in Zilliz Cloud and Google Admin console.

![LsmAwFbPthojH3bLRtEcogRinwc](https://zdoc-images.s3.us-west-2.amazonaws.com/LsmAwFbPthojH3bLRtEcogRinwc.png)

## Before you start\{#before-you-start}

- Your Zilliz Cloud organization has at least one **Dedicated (Enterprise)** cluster.

- You must have the Admin role in the Google Admin console.

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Configuration steps\{#configuration-steps}

### Step 1: Access SP details in Zilliz Cloud console\{#step-1-access-sp-details-in-zilliz-cloud-console}

As the SP, Zilliz Cloud provides the **Entity ID** and **ACS URL** required when setting up your SAML app in Google Admin.

<Supademo id="cme6flmz31zk2h3py5y8zv82m" title="Step 1: Access service provider details in Zilliz Cloud" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the dialog box that appears, choose **Google Workspace (SAML 2.0)** as your IdP and protocol.

1. In the **Service Provider Details** card, copy your **Entity ID** and **ACS URL**. These values will be required in [Step 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console) when creating a SAML app in Google Admin console.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, you can copy the <strong>SSO URL</strong> and <strong>Certificate</strong> here. In this case, you need to configure IdP details in Manual mode in <a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p>

    </Admonition>

1. Once that's done, proceed to [Step 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console).

### Step 2: Create a custom SAML app in Google Admin console\{#step-2-create-a-custom-saml-app-in-google-admin-console}

In this step, you configure Google Workspace (the IdP) with the SP details obtained from Zilliz Cloud.

<Supademo id="cmdwjibf16qq99f96c9uz5n8i" title="Step 2: Create SAML app in Google Admin" />

1. Log in to the [Google Admin console](https://admin.google.com/).

1. In the left-side navigation pane, choose **Apps** > **Web and mobile apps**. Then choose **Add app** > **Add custom SAML app**.

1. Customize the app name (e.g **zilliz**) and click **CONTINUE**.

1. On the page that appears, download your IdP metadata from **Option 1: Download IdP metadata**. This will be required in [Step 3](./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console) when configuring IdP settings in Zilliz Cloud console. Then, click **Continue**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, get your <strong>SSO URL</strong>, <strong>Entity ID</strong>, <strong>Certificate</strong> from <strong>Option 2: Copy the SSO URL, entity ID, and certificate</strong>, respectively. These will be required in Zilliz Cloud console if the <strong>Manual</strong> mode is selected in <a href="./single-sign-on-with-google-workspace#step-3-configure-idp-settings-in-zilliz-cloud-console">Step 3</a>.</p>

    </Admonition>

1. In the **Service provider details** section, configure:

    - **ACS URL**: Paste the **ACS URL** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console).

    - **Entity ID**: Paste the **Entity ID** you copied from Zilliz Cloud console in [Step 1](./single-sign-on-with-google-workspace#step-1-access-sp-details-in-zilliz-cloud-console).

    Once that's done, click **Continue**.

1. In the **Attributes** section, configure:

    - **Google Directory attributes**: Click **ADD MAPPING** and select **Primary email**.

    - **App attributes**: Set the value to **email**.

1. Click **Finish**.

### Step 3: Configure IdP settings in Zilliz Cloud console\{#step-3-configure-idp-settings-in-zilliz-cloud-console}

In this step, you provide Google Workspace’s IdP details back to Zilliz Cloud to complete the SAML trust relationship.

<Supademo id="cme6g56mb1zs2h3pyn5cynqgb" title="Step 3: Configure IdP settings in Zilliz Cloud" />

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. In the **Identity Provider Details** card of the **Configure Single Sign-On (SSO)** dialog box, upload the metadata file you downloaded from Google Admin console in [Step 2](./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Alternatively, if you select the <strong>Manual</strong> mode for IdP detail configuration, configure:</p>
    <ul>
    <li><p><strong>SSO URL</strong>: Paste the <strong>SSO URL</strong> you copied in <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">Step 2</a> here.</p></li>
    <li><p><strong>Certificate</strong>: Paste the <strong>Certificate</strong> you copied in <a href="./single-sign-on-with-google-workspace#step-2-create-a-custom-saml-app-in-google-admin-console">Step 2</a> here.</p></li>
    </ul>

    </Admonition>

1. Once that's done, click **Save**.

## Post-configuration tasks\{#post-configuration-tasks}

### Task 1: Assign SAML app to users (Google Admin console)\{#task-1-assign-saml-app-to-users-google-admin-console}

<Supademo id="cmdwrmzn36umt9f96nzntwaxq" title="Task 1: Assign SAML app to users" />

Before users can access Zilliz Cloud through SSO, turn on your SAML app:

1. On the details page of the newly created app, locate the **User access** area and click to edit the service status.

1. To turn a service on or off for everyone in your organization, click **ON** for everyone or **OFF** for everyone, and then click **Save**.

1. (Optional) To turn a service on or off for an organizational unit:

    1. At the left, select the organizational unit.

    1. To change the Service status, select **ON** or **OFF**.

    1. Choose one:

        - If the **Service status** is set to **Inherited** and you want to keep the updated setting, even if the parent setting changes, click **Override**.

        - If the **Service status** is set to **Overridden**, either click **Inherit** to revert to the same setting as its parent, or click **Save** to keep the new setting, even if the parent setting changes.
Note: Learn more about [organizational structure](https://support.google.com/a/answer/4352075).

1. (Optional) To turn on a service for a set of users across or within organizational units, select an access group. For details, go to [Use groups to customize service access](https://support.google.com/a/answer/9050643).

1. Ensure that the email addresses your users use to sign in to the SAML app match the email addresses they use to sign in to your Google domain.

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