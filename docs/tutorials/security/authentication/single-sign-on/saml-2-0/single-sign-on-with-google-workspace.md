---
title: "Google Workspace | Cloud"
slug: /single-sign-on-with-google-workspace
sidebar_label: "Google Workspace"
beta: CONTACT SALES
notebook: FALSE
description: "Google Workspace with Google Workspace over the SAML protocol. | Cloud"
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
  - knn algorithm
  - HNSW
  - What is unstructured data
  - Vector embeddings

---

import Admonition from '@theme/Admonition';


# Google Workspace

[Google Workspace](https://workspace.google.com/lp/business/) is a comprehensive suite of productivity and collaboration tools provided by Google. Zilliz Cloud allows you to configure single sign-on (SSO) with Google Workspace over the SAML protocol.

![LsmAwFbPthojH3bLRtEcogRinwc](/img/LsmAwFbPthojH3bLRtEcogRinwc.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Though the SSO feature is in <strong>General Availability</strong>, please <a href="https://zilliz.com/contact-sales">contact</a><a href="https://zilliz.com/contact-sales"> sales</a> for access.</p>

</Admonition>

## Before you start{#before-you-start}

- You must have the Admin role in the Google Admin console.

- You are the Organization Owner in the Zilliz Cloud organization where SSO is to be configured.

## Step 1: Create SAML app in Google Admin console{#step-1-create-saml-app-in-google-admin-console}

1. Log in to the [Google Admin console](https://admin.google.com).

1. In the left-side navigation pane, choose **Apps** > **Web and mobile apps**. Then choose **Add app** > **Add custom SAML app**.

    ![M6xfbozsioV9SdxlLFOcCmRUnch](/img/M6xfbozsioV9SdxlLFOcCmRUnch.png)

1. Provide a name and description for your custom SAML app. This information will be shared with the app users. Click **CONTINUE**.

    ![sso-google-workspace-1](/img/sso-google-workspace-1.png)

1. On the page that appears, you will see details such as the **SSO URL**, **Entity ID**, and **Certificate**. Copy these details as you will need them in the next steps.

    ![sso-google-workspace-2](/img/sso-google-workspace-2.png)

## Step 2: Provide IdP metadata on Zilliz Cloud{#step-2-provide-idp-metadata-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and go to the organization for which you want to configure SSO.

1. In the left-side navigation pane, click **Settings**.

1. On the **Settings** page, find the **Single Sign-On (SSO)** section and click **Configure**.

    ![IAf9b7w2KovCaHxCT7Kc1hMdnMe](/img/IAf9b7w2KovCaHxCT7Kc1hMdnMe.png)

1. In the **Configure Single Sign-On (SSO)** dialog box, choose **SAML 2.0**.

    ![sso-google-workspace-3](/img/sso-google-workspace-3.png)

1. In the dialog box that appears, replace the default IdP metadata with the values you copied from the Google Admin console:

    1. **Single Sign-On URL**: Paste the **SSO URL** from Google.

    1. **Entity ID**: Paste the **Entity ID** from Google.

    1. **Certificate**: Paste the **Certificate** from Google.

    Click **Save** once the fields are updated.

    ![sso-google-workspace-4](/img/sso-google-workspace-4.png)

1. In the **Verify Redirect URL to Complete SSO Configuration** dialog box, copy the redirect URL provided by Zilliz Cloud.

    ![sso-google-workspace-5](/img/sso-google-workspace-5.png)

## Step 3: Verify redirect URL in Google Admin console{#step-3-verify-redirect-url-in-google-admin-console}

1. Go back to the window where you were configuring the custom SAML app in the [Google Admin console](https://admin.google.com).

1. In the **Service provider details** step, update the following:

    - **ACS URL**: Paste the redirect URL you just copied from Zilliz Cloud.

    - **Entity ID**: Enter **zilliz**.

    Then click **CONTINUE**.

    ![sso-google-workspace-6](/img/sso-google-workspace-6.png)

1. In the Attributes section, click **ADD MAPPING** to map user attributes based on the service provider’s requirements:

    - **Basic Information**: Select **Primary email**.

    - **App attributes**: Enter **email**.

    ![sso-google-workspace-7](/img/sso-google-workspace-7.png)

    Then click **Finish**. You will be redirected to the details page of the created app.

## Step 4: Turn on your SAML app{#step-4-turn-on-your-saml-app}

1. On the details page of the newly created app, locate the **User access** area and click to edit the service status.

    ![Y4Tjb3r0KoHzwgxpC4ocOfWVnph](/img/Y4Tjb3r0KoHzwgxpC4ocOfWVnph.png)

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

## Test configuration{#test-configuration}

To ensure your SSO setup is functional:

1. Open a new browser window and navigate to the Zilliz Cloud SSO login URL provided earlier.

1. You should be redirected to the Google Workspace login page.

1. Log in using the credentials of a user who has been granted access to the app in Google Admin console.

1. If SSO is configured correctly, you will be redirected to the Zilliz Cloud console after successful authentication.

<Admonition type="info" icon="📘" title="Notes">

<p>By default, users logging in via SSO are granted the Organization Member role. To expand their permissions, you can modify their roles in the Zilliz Cloud console.</p>

</Admonition>

If you encounter any issues during the setup or testing process, contact [Zilliz support](https://support.zilliz.com/hc/en-us) for assistance.