---
title: "Manage Projects | Cloud"
slug: /manage-projects
sidebar_label: "Projects"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations. | Cloud"
type: origin
token: NXypwJ2ySiv7RAkyKb5cZ9SKnvf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - projects
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Manage Projects

In Zilliz Cloud, a project serves as a logical container within an organization, grouping clusters and related resources. You can create multiple projects tailored to different aspects of your business. For example, if your company offers multimedia recommendation services, you can create one project for video recommendations and another for music recommendations.

This guide will walk you through the steps of managing projects.

## Create a project\{#create-a-project}

Each organization comes with a default **Enterprise** project named `Default Project` that cannot be deleted. Based on your workload and business needs, you can create additional projects. When you create a project, you automatically become the [Project Admin](./project-users) of the project.

### Limits\{#limits}

- To create a project, you must be an [Organization Owner](./organization-users).

- You can create a maximum of 100 projects in each organization.

### Procedures\{#procedures}

When creating a project, you need to specify the project name and select a project plan that best suits your needs. The plan determines available features and the billing. For details about the pricing, plan differences, and how to select a right plan, see [Detailed Plan Comparison](./select-zilliz-cloud-service-plans).

You can create a project via the Zilliz Cloud web console or RESTful API.

- **Via web console**

    The following demo shows how to create a project on the Zilliz Cloud web console.

    <Supademo id="cmhivxhnz5zctfatifx1jw34l?utm_source=link" title=""  />

    ![create-project](https://zdoc-images.s3.us-west-2.amazonaws.com/create-project.png "create-project")

- **Via RESTful API**

    The following example shows how to create a Standard project named `My Project` in the current organization. For details, see [Create Project](/reference/restful/create-project-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "projectName": "My Project",
        "plan": "Standard"
    }'
    ```

    The following is an example output.

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

## Upgrade a project\{#upgrade-a-project}

To unlock for advanced features, you can upgrade the plan of your existing projects.

Upgrading the project will also upgrade all clusters in the project.

If you need to upgrade a project to the **Business Critical** or **BYOC** plan, please [contact sales](https://zilliz.com/contact-sales).

- **Via web console**

    The following demo shows how to upgrade the plan of a project from **Standard** to **Enterprise**.

    <Supademo id="cmhiw3gu85zhlfati4r154s2h?utm_source=link" title=""  />

- **Via RESTful API**

    The following demo shows how to upgrade the plan of a project from Standard to Enterprise. For details, see [Upgrade Project](/reference/restful/upgrade-project-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request PATCH \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "plan": "Enterprise"
    }'
    ```

    The following is an example output.

    ```bash
    {
        "code": 0,
        "data": {
            "projectId": "proj-x"
        }
    }
    ```

## View all projects\{#view-all-projects}

You can view the list of all projects in your permission scope in the organization.

- **Via web console**

    ![view-projects-saas](https://zdoc-images.s3.us-west-2.amazonaws.com/view-projects-saas.png "view-projects-saas")

- **Via RESTful API**

    The following example shows how to list all projects in the current organization. For details, see [List Projects](/reference/restful/list-projects-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json"
    ```

    The following is an example output.

    ```json
    {
        "code": 0,
        "data": [
            {
                "projectName": "Default Project",
                "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
                "instanceCount": 2,
                "createTime": "2023-08-16T07:34:06Z",
                "plan": "Enterprise"
            }
        ]
    }
    ```

## View project details\{#view-project-details}

You can also check the details of a certain project.

- **Via web console**

    You can check the project name, plan, creation time, and the number of clusters within the project on the **Projects** page. You can further click on a certain project to view its clusters.

    ![NoSTbfMVjoPp99x5cjcc0cwWnbd](https://zdoc-images.s3.us-west-2.amazonaws.com/nostbfmvjopp99x5cjcc0cwwnbd.png "NoSTbfMVjoPp99x5cjcc0cwWnbd")

- **Via RESTful API**

    The following example describes the project `proj-xxxxxxxxxxxxxxx`. For details, see [Describe Project](/reference/restful/describe-project-v2).

    ```bash
    export TOKEN="YOUR_API_KEY"
    export projectId="proj-xx"
    
    curl --request GET \
    --url "${BASE_URL}/v2/projects/${projectId}" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json"
    ```

    The following is an example output

    ```json
    {
        "code": 0,
        "data": {
            "projectId": "proj-x",
            "projectName": "My Project",
            "instanceCount": 2,
            "createTime": "2023-08-16T07:34:06Z",
            "plan": "Enterprise"
        }
    }
    ```

## Rename a project\{#rename-a-project}

To rename a project, you must be an [Organization Owner](./organization-users). You can rename a project via the web console.

<Supademo id="cmhiwa69y5zk2fatiw4ou24k6?utm_source=link" title=""  />

## Delete a project\{#delete-a-project}

To delete a project, you must be an [Organization Owner](./organization-users). 

Before you delete a project, you must drop all [clusters](./manage-cluster#drop-cluster) and [volumes](./manage-volumes-via-console#delete-a-volume) within the project.

Once a project is deleted, all its associated data and resources will be irreversibly cleaned as well.

<Admonition type="info" icon="📘" title="Notes">

<p>The default project cannot be deleted.</p>

</Admonition>

You can delete a project via the web console.

<Supademo id="cmhiwf80b5zoufatic4p14w7m?utm_source=link" title=""  />

