---
title: "Okta | Cloud"
slug: /single-sign-on-with-okta
sidebar_label: "Okta"
beta: CONTACT SALES
notebook: FALSE
description: "This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol. | Cloud"
type: origin
token: QUC4wfVYTi73ctkMzEec17oVnjh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - sso
  - okta
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Okta

This topic describes how to configure single sign-on (SSO) with Okta using the SAML 2.0 protocol.

![KywHwe7VIhcwsAbecTpcEsL3njb](/img/KywHwe7VIhcwsAbecTpcEsL3njb.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Though the SSO feature is in <strong>General Availability</strong>, please <a href="https://zilliz.com/contact-sales">contact</a><a href="https://zilliz.com/contact-sales"> sales</a> for access.</p>

</Admonition>

## Before you start{#before-you-start}

Before you begin the SSO configuration, make sure the following conditions are met:

- You are the Organization Owner of the organization where SSO is to be configured.

- You have Admin access to the Okta console. For more information, refer to [Okta official documentation](https://help.okta.com/en-us/content/topics/security/administrators-learn-about-admins.htm).

## Configuration steps{#configuration-steps}

### Step 1: Create a SAML app in Okta console{#step-1-create-a-saml-app-in-okta-console}

<Supademo id="cmdh3bndv2ym06n9n9gx8epyd" title="Step 1: Create SAML App in Okta Console" />

1. Log in to the [Okta Admin console](https://login.okta.com/).

1. In the left-side navigation pane, choose **Applications** > **Applications**.

1. Click **Create App Integration**.

1. In the **Create a new app integration** dialog box, select **SAML 2.0** and click **Next**.

1. For simplicity, set **App name** to **zilliz**, then click **Next**.

1. In the **General** area of the **Configure SAML** step, configure the fields below:

    - **Single Sign On URL**: 

        - Enter a temporary placeholder URL, such as `http://www.okta.com`. You will replace this with the actual URL from the Zilliz Cloud console later in [Step 2](./single-sign-on-with-okta#step-2-configure-okta-settings-in-zilliz-cloud-console).

        - Be sure to **check the box** labeled **"Use this for Recipient URL and Destination URL"** to ensure correct routing during SAML requests.

    - **Audience URI (SP Entity ID)**: Set the value to **zilliz**.

1. In the **Attribute Statements (optional)** area, specify:

    - **Name**: Set the value to **email**.

    - **Value**: Select **user.email** from the drop-down list.

1. Click **Next**, then click **Finish**. You will be redirected to the app page.

1. On the **Sign On** tab of the app page, click **More details** to get the following app details:

    - **Sign on URL**: Copy the URL. It will be required in Zilliz Cloud console in [Step 2](./single-sign-on-with-okta#step-2-configure-okta-settings-in-zilliz-cloud-console).

    - **Signing Certificate**: Click **Download** to save the certificate to your local computer. It will be required in Zilliz Cloud console in [Step 2](./single-sign-on-with-okta#step-2-configure-okta-settings-in-zilliz-cloud-console).

Then, proceed to [Step 2](./single-sign-on-with-okta#step-2-configure-okta-settings-in-zilliz-cloud-console) to continue SSO settings in Zilliz Cloud console.

### Step 2: Configure Okta settings in Zilliz Cloud console{#step-2-configure-okta-settings-in-zilliz-cloud-console}

<Supademo id="cmdh2wk6b2y8q6n9nilbi2d19" title="Step 2: Configure Okta Settings in Zilliz Cloud Console" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, choose **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

1. In the **Single Sign-On (SSO)** dialog box, select **SAML 2.0**, then configure the settings below:

    - **Single Sign-On URL**: Paste the **Sign on URL** value copied from [Okta console](https://login.okta.com/) in [Step 1](./single-sign-on-with-okta#step-1-create-a-saml-app-in-okta-console). This URL receives the SAML authentication requests from Okta.

    - **Entity ID**: Set the value to **zilliz**.

    - **Certificate**: Open the certificate file downloaded in [Step 1](./single-sign-on-with-okta#step-1-create-a-saml-app-in-okta-console) on your computer. Copy the entire certificate content, including the lines beginning with `-----BEGIN CERTIFICATE-----` and ending with `-----END CERTIFICATE-----`, and paste it into the field provided.

1. Click **Save**.

1. In the dialog box that appears, copy the redirect URL. It will be required in [Okta console](https://login.okta.com/) in [Step 3](./single-sign-on-with-okta#step-3-update-sso-url-in-okta-console). You will also see a Zilliz Cloud login URL, which will be used for SSO login once all setup settings are complete.

### Step 3: Update SSO URL in Okta console{#step-3-update-sso-url-in-okta-console}

<Supademo id="cmdh69qhu32886n9niy61fz4y" title="Step 3: Update SSO URL in Okta Console" />

After saving the Okta app details in Zilliz Cloud, you are provided with a redirect URL:

1. Return to the [Okta console](https://login.okta.com/) and navigate to the SAML app you created.

1. Update the SAML settings by replacing the placeholder **Single Sign On URL** (set in [Step 1](./single-sign-on-with-okta#step-1-create-a-saml-app-in-okta-console)) with the redirect URL you copied from Zilliz Cloud.

1. Save the changes.

## Post-configuration tasks{#post-configuration-tasks}

### Task 1: Assign SAML app to users (Okta console){#task-1-assign-saml-app-to-users-okta-console}

<Supademo id="cmdh6fi1g32hv6n9nea0dz3e4" title="Step 4: Assign SAML App to Users" />

Before users can access Zilliz Cloud through SSO, you need to assign the Okta application to them:

1. In the [Okta Admin console](https://login.okta.com/), click **Assignments**.

1. Choose **Assign** > **Assign to People**.

1. Assign the SAML app to the user and save the changes.

1. Click **Save** and **Go Back**.

Repeat for all users as needed. See [Okta documentation](https://help.okta.com/oie/en-us/content/topics/provisioning/lcm/lcm-assign-app-groups.htm) for more.

### Task 2: Log in with SSO URL (end users){#task-2-log-in-with-sso-url-end-users}

 <Supademo id="cmdhgrwuz3d6w6n9nqwfifmd2" title="Step 5: Log into Zilliz Cloud with SSO URL" />

Users that have been assigned the SAML app can access Zilliz Cloud console using the SSO login URL provided by Zilliz Cloud:

1. Open a new browser window and navigate to the Zilliz Cloud SSO login URL provided earlier.

1. You should be redirected to the Okta login page.

1. Log in using the credentials of a user who has been assigned the SAML app in Okta.

1. If SSO is configured correctly, you will be redirected to the Zilliz Cloud console after successful authentication.

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://zilliz.com/contact-sales).

## FAQ{#faq}

### What role is assigned to users who log in via SSO for the first time?{#what-role-is-assigned-to-users-who-log-in-via-sso-for-the-first-time}

New users who do not already have a Zilliz Cloud account will be automatically created upon their first SSO login. These users are assigned the **Organization Member** role by default. You can modify their roles later in the Zilliz Cloud console.

### How do users access projects after SSO login?{#how-do-users-access-projects-after-sso-login}

After logging in via SSO, users will have **Organization Member** role by default. To access specific projects, an **Organization Owner** or **Project Admin** must invite them to projects. For detailed steps, see [Manage Project Users](./project-users).

### What happens if a user already has a Zilliz Cloud account before logging in with SSO?{#what-happens-if-a-user-already-has-a-zilliz-cloud-account-before-logging-in-with-sso}

If the user already exists in your Zilliz Cloud organization (based on their email), they will retain their original role and permissions when logging in via SSO. The system matches users by email address and does not overwrite existing accounts.

### I'm having issues with SSO configuration or users can't log in. What should I check?{#im-having-issues-with-sso-configuration-or-users-cant-log-in-what-should-i-check}

If you encounter configuration errors or login issues, verify the following:

- **Certificate format:** Ensure the certificate includes complete BEGIN and END lines:

    ```plaintext
    -----BEGIN CERTIFICATE-----
    (certificate body)
    -----END CERTIFICATE-----
    ```

- **Single Sign-On URL:** Verify the **Sign on URL** from Okta is correctly pasted.

- **Entity ID:** Confirm it's set to `zilliz` in both Okta and Zilliz Cloud.

- **Attribute Statements:** Ensure email mapping is configured (`Name = email`, `Value = user.email`).

- **User Assignment:** The user is assigned the SAML app in Okta.

- **Email Matching:** The email in Okta matches the email in Zilliz Cloud.

### Can I configure multiple SSO providers for the same organization?{#can-i-configure-multiple-sso-providers-for-the-same-organization}

Currently, each Zilliz Cloud organization supports only **one active SAML SSO configuration** at a time.