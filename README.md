# `dorametrix` 🚀 🧑‍🚀 🧑🏿‍🚀 🧑🏻‍🚀 👩‍🚀 📈

![Build Status](https://github.com/mikaelvesavuori/dorametrix/workflows/main/badge.svg) [![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fdorametrix.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fmikaelvesavuori%2Fdorametrix?ref=badge_shield) [![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=mikaelvesavuori_dorametrix&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=mikaelvesavuori_dorametrix) [![CodeScene Code Health](https://codescene.io/projects/23699/status-badges/code-health)](https://codescene.io/projects/23699) [![CodeScene System Mastery](https://codescene.io/projects/23699/status-badges/system-mastery)](https://codescene.io/projects/23699) [![codecov](https://codecov.io/gh/mikaelvesavuori/dorametrix/branch/main/graph/badge.svg?token=AIV06YBT8U)](https://codecov.io/gh/mikaelvesavuori/dorametrix) [![Maintainability](https://api.codeclimate.com/v1/badges/1a609622737c6c48225c/maintainability)](https://codeclimate.com/github/mikaelvesavuori/dorametrix/maintainability)

## Know if you are running high-performing software development teams by making it clear how individual products (i.e. services, APIs, systems...) line up with the [DORA metrics](https://www.leanix.net/en/wiki/vsm/dora-metrics).

`dorametrix` is a Node.js-based service that helps you calculate your DORA metrics, by inferring your metrics from events you can create manually or with webhooks. It has pre-baked support for push and incident events from GitHub Actions, Bitbucket and Jira (only incidents!), and can be run "as is" as a web service, too.

🏖️ It's super easy to get started with, comes pre-packaged and needs just a tiny bit of fiddling with webhooks and settings on your end: Simply put, the easiest way you can start using DORA metrics in a scalable way today!

✋ ℹ️ Credit where credit is due: This project is strongly influenced by [Google Cloud's `Four Keys`](https://github.com/GoogleCloudPlatform/fourkeys) project. The Four Keys project is great but is, for obvious reasons, Google Cloud-oriented. It also uses a SQL database and ETL pattern which is less than ideal from a serverless perspective. In general, the approach and the structuring and nomenclature is the same here. Most interestingly, that `dorametrix` is better decoupled from the specifics of any one CI tool, and uses DynamoDB (NoSQL) instead of BigQuery.

## How `dorametrix` works

At its heart, `dorametrix` is a serverless web service that collects and represents specific delivery-related events that you send to it, which are then stored in a database. As a user you can request these metrics, which are calculated from the same stored events.

_For more exact information, see the section "What are the DORA metrics and how does `dorametrix` calculate them?" further down._

### The events

The most basic data type we have is the **Event**. These are internally created from inputs to the service. For example, when you push a commit, an Event is added to the database. The event will contain, for example, information like the commit SHA, time of the commit, and similar. We keep the events indefinitely so we can have a complete record of all `dorametrix` events that have occurred.

`dorametrix` will also (on its own) add individual domain-specific records for (respectively) a Change, Deployment, or Incident, based on the incoming data. This is so we can easily follow up on those typologies and make the desired calculations.

- **Changes** essentially correspond to `push`-type lifecycle events, since these represent commits.
- **Deployments** are added by you manually, as a separate activity at the end of a deployment pipe.
- **Incidents** are special, and more complex, since they both have to be raised and (later) be resolved. This can be done manually by calling `dorametrix` but it's highly recommended (and much more practical) to let your issue tracker send such events by webhook based on actual user interactions with issues or tickets.

---

## Diagrams

### Solution diagram

_As it stands currently, `dorametrix` is implemented in an AWS-oriented manner. This should be fairly easy to modify so it works with other cloud platforms and with other persistence technologies. If there is sufficient demand, I might add extended support. Or you do it! Just make a PR and I'll see how we can proceed._

!["Dorametrix diagram"](./diagrams/dorametrix-diagram.png)

### Code flow diagram

!["Dorametrix code diagram"](./diagrams/arkit.svg)

Please see the [generated documentation site](https://dorametrix.pages.dev) for more detailed information.

---

## Prerequisites

- Recent [Node.js](https://nodejs.org/en/) (ideally 18+) installed.
- Amazon Web Services (AWS) account with sufficient permissions so that you can deploy infrastructure. A naive but simple policy would be full rights for CloudWatch, Lambda, API Gateway, DynamoDB, X-Ray, and S3.
- Ideally some experience with [Serverless Framework](https://www.serverless.com) as that's what we will use to deploy the service and infrastructure.
- You will need to deploy the stack prior to working with it locally as it uses actual infrastructure even in local mode.

## Installation

Clone, fork, or download the repo as you normally would. Run `npm install`.

## Commands

The below commands are the most critical ones. See `package.json` for more commands! Substitute `npm` for `yarn` or whatever floats your boat.

- `npm start`: Run Serverless Framework in offline mode
- `npm test`: Run tests on the codebase
- `npm run deploy`: Deploy with Serverless Framework
- `npm run build`: Package and build the code with Serverless Framework
- `npm run teardown`: Removes the deployed stack

## Configuration

### Application settings

You can set certain values in `serverless.yml`.

#### Required

- `custom.config.accountNumber`: Your AWS account number.
- `custom.config.authToken`: The "API key" or authorization token you want to use to secure your service (for requests, not for adding events which is always open). You will use this when calling the service.

Note that all unit tests use a separate authorization token that you don't have to care about in regular use.

#### Optional

- `custom.config.tableName`: This defaults to `dorametrix` but can be changed.

### Optional: Set up your incident handling webhook

_This is highly recommended but not strictly necessary, though it will become quite a hassle if you do not automate incident handling._

#### GitHub

Create a webhook; [see this guide if you need instructions](https://docs.github.com/en/developers/webhooks-and-events/webhooks/creating-webhooks).

Add your `dorametrix` endpoint URL, set the content type to `application/json` and select the event types `Issues` and `Push`.

#### Bitbucket

Create a webhook; [see this guide if you need instructions](https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/#Create-webhooks).

Add your `dorametrix` endpoint URL and select the event types `Repository:Push`, `Issue:Created` and `Issue:Updated`.

#### Jira

Create a webhook; [see this guide if you need instructions](https://developer.atlassian.com/server/jira/platform/webhooks/#registering-a-webhook).

Add your `dorametrix` endpoint URL and select the event types `Repository:Push`, `Issue:created`, `Issue:updated`, `Issue:deleted`.

#### Note on security with webhook secrets

The current version of `dorametrix` does not have built-in support for GitHub webhook secrets, but if there is sufficient demand I might add such support.

_Note that Bitbucket Cloud and Jira do not have support for webhook secrets: https://jira.atlassian.com/browse/BCLOUD-14683._

## Running locally

Run `npm start`.

Note that it will attempt to connect to a database, so deploy the application and infrastructure before any local development.

## Deployment

Run `npm run deploy`.

## Logging and metrics

`gitmetrix` uses [mikrolog](https://github.com/mikaelvesavuori/mikrolog) and [mikrometric](https://github.com/mikaelvesavuori/mikrometric) for logging and metrics respectively.

Logs will have a richly structured format and metrics for cached and uncached reads will be output to CloudWatch Logs (using Embedded Metrics Format, under the covers).

---

## Raising `dorametrix` events

### Creating deployments

You can create deployments either manually, with the provided script, or use ready-made actions or pipes to abstract that part for you.

#### Manually

Download the `deployment.sh` script in this repository. In your CI script, call the script at the end of your deployment, for example:

```yaml
bash deployment.sh "$ENDPOINT" "$API_KEY" "$PRODUCT"
```

As seen above, the required inputs are:

1. The endpoint
2. The API key
3. The product name

#### GitHub Actions action

An example using two user-provided secrets for endpoint (`DORAMETRIX_ENDPOINT`) and API key (`DORAMETRIX_API_KEY`):

```yaml
steps:
  - name: Checkout
    uses: actions/checkout@v3
    with:
      fetch-depth: 0

  - name: Dorametrix
    uses: mikaelvesavuori/dorametrix-action@v1.0.0
    with:
      endpoint: ${{ secrets.DORAMETRIX_ENDPOINT }}
      api-key: ${{ secrets.DORAMETRIX_API_KEY }}
```

A full example is available at [https://github.com/mikaelvesavuori/demo-dorametrix-action](https://github.com/mikaelvesavuori/demo-dorametrix-action).

The specific action, `mikaelvesavuori/dorametrix-action@v1.0.0`, is available for use.

#### Bitbucket Pipelines pipe

An example using two user-provided secrets and setting the product with a known variable representing the repo name:

```yaml
- step:
    name: Dorametrix
    script:
      - pipe: docker://mikaelvesavuori/dorametrix-pipe:1.0.0
        variables:
          ENDPOINT: '$ENDPOINT'
          API_KEY: '$API_KEY'
          PRODUCT: '$BITBUCKET_REPO_SLUG'
```

A full example is available at [https://github.com/mikaelvesavuori/demo-dorametrix-pipe](https://github.com/mikaelvesavuori/demo-dorametrix-pipe).

The specific action, `docker://mikaelvesavuori/dorametrix-pipe:1.0.0`, is available for use but is highly limited when it comes to pulling it (since it is hosted on a free plan). **It's therefore highly recommended that you host or push your own image if you are within the Bitbucket + Docker Hub infrastructure!**

### Creating incidents

See below for the tool-specific conventions.

#### GitHub

- **Open incident**: Create a GitHub Issue with an `incident` label.
- **Close incident**: Close the Issue or unlabel the `incident` label.

#### Bitbucket

- **Open incident**: Create a Bitbucket Issue with a `bug` label.
- **Close incident**: Close the Issue or unlabel the `bug` label.

#### Jira

- **Open incident**: Create a Jira Issue with an `incident` label.
- **Close incident**: Close the Issue or unlabel the `incident` label.

---

## What are the DORA metrics and how does `dorametrix` calculate them?

_Quotes from [a blog post on Google Cloud](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)._

The period that is taken into account is 30 days in most cases, or 7 days for deployment frequency. These values are configurable.

### Deployment frequency

> How **often** an organization **successfully** releases to **production**.

#### Data collection

1. Send a `CHANGE` event when starting up the CI build. You can do this with either a direct call to the `dorametrix` API endpoint, or by using a webhook ("push" event or similar) in [GitHub](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks), [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/), or [Jira](https://developer.atlassian.com/server/jira/platform/webhooks/).
2. Send a `DEPLOYMENT` event after pushing code to your production environment. You can do this with either a direct call to the `dorametrix` API endpoint, or by using a convenience [GitHub action](https://github.com/mikaelvesavuori/dorametrix-action) or [Bitbucket pipe](https://github.com/mikaelvesavuori/dorametrix-pipe) for your CI. See the [GitHub action demo](https://github.com/mikaelvesavuori/demo-dorametrix-action) or [Bitbucket pipe demo](https://github.com/mikaelvesavuori/demo-dorametrix-pipe) for more information.

#### Calculation

`{number of deployments in period} / {number of incidents in period}` is the standard (i.e. number of deployments in the last week).

### Lead Time for Changes

> The amount of **time** it takes a **commit** to get into **production**.

#### Data collection

Same as deployment frequency (see above).

#### Calculation

The solution used in `dorametrix` is based on calculating the difference between the earliest commit timestamp in a change batch (that lead to a deployment) with the timestamp of the actual deployment.

`{accumulated time of every first commit for each deployment} / {number of deployments}`

### Change Failure Rate

> The **percentage** of **deployments** causing a **failure** in production.

#### Data collection

Send an `INCIDENT` event. You can do this with either a direct call to the `dorametrix` API endpoint, or by using a webhook ("opened"/"closed"/"labeled"/"unlabeled" event or similar) in [GitHub](https://docs.github.com/en/developers/webhooks-and-events/webhooks/about-webhooks), [Bitbucket](https://support.atlassian.com/bitbucket-cloud/docs/manage-webhooks/), or [Jira](https://developer.atlassian.com/server/jira/platform/webhooks/). The conventions are listed above, in the "Configuration" section.

You could certainly look into other types of integrations and automations, for example by connecting a failing function with calling `dorametrix` (or connecting Cloudwatch to it).

#### Calculation

Some thinkers in the DORA metrics space will say that we need to understand whether a deployment was successful or failed. In `dorametrix` this is seen as unimportant and an over-complication of matters. Instead, all deployments are simply... deployments.

`{incident count} / {deployment count}`.

### Time to Restore Services

> How **long** it takes an organization to **recover** from a **failure** in production.

#### Data collection

Depends on the above collection of incidents (change failure rate).

#### Calculation

This is very straight-forward, just add the total time of all incidents (from start to being resolved). Unresolved tasks will obviously continue to add up.

`{accumulated time of all incidents} / {actual incident count}`.

---

## Details on the technical implementation

### Anonymous data

`dorametrix` does not collect, store, or process any details on a given individual and their work. All data is strictly anonymous and aggregated. You should feel entirely confident that nothing invasive is happening with the data handled with `dorametrix`.

### Metrics and history

The granularity of metrics collection is on the daily level, in the format `YYYYMMDD` (e.g. `20221020`). While you can get a range of dates, you can't get more exact responses than a full day.

**The most recent date you can get metrics for is the day prior, i.e. "yesterday"**. The reason for this is partly because it makes no real sense to get incomplete datasets, as well as because `gitmetrix` caches all data requests. Caching a dataset with incomplete data would not be very good.

### Time

#### Time zone used

This uses UTC/GMT/Zulu time.

#### How timestamps are set

Timestamps are set internally in `dorametrix` and generated based on the UTC/GMT/Zulu time.

**This should be fine for most circumstances but will possibly be inaccurate if you have teams that are very widely distributed**, in which case certain events may be posted to the wrong date.

To cater for more precise queries, you can use the `offset` parameter with values between `-12` and `12` (default is `0`) to adjust for a particular time zone.

### Caching

On any given metrics retrieval request, `gitmetrix` will behave in one of two ways:

- **Cached filled**: Return the cached content.
- **Cache empty**: Query > Store response in cache > Return response.

Caching is always done for a range of dates. All subsequent lookups will use the cached data only if the exact same "from" and "to" date ranges are cached.

| Primary Key                 | Secondary Key           | Value (example)           |
| --------------------------- | ----------------------- | ------------------------- |
| `METRICS_CACHED_{ORG/REPO}` | `{FROM_DATE}_{TO_DATE}` | `Items` array of response |

---

## Example API calls

All of the below demonstrates "directly calling" the API; since webhook events from GitHub, Bitbucket and Jira have other (varying shapes) they are out-of-scope for the example calls.

### Create change

#### Request

`POST {{BASE_URL}}/event`

```json
{
  "eventType": "change",
  "product": "demo"
}
```

#### Successful response

`204 No Content`

### Create deployment

#### Request

`POST {{BASE_URL}}/event`

```json
{
  "eventType": "deployment",
  "product": "demo",
  "changes": [
    {
      "id": "356a192b7913b04c54574d18c28d46e6395428ab",
      "timeCreated": "1642879177"
    },
    {
      "id": "da4b9237bacccdf19c0760cab7aec4a8359010b0",
      "timeCreated": "1642874964"
    },
    {
      "id": "77de68daecd823babbb58edb1c8e14d7106e83bb",
      "timeCreated": "1642873353"
    }
  ]
}
```

#### Successful response

`204 No Content`

### Create incident

#### Request

`POST {{BASE_URL}}/event`

```json
{
  "eventType": "incident",
  "product": "demo"
}
```

#### Successful response

`204 No Content`

### Get all metrics from last X days ("sliding window")

#### Request

`GET {{BASE_URL}}/metrics?repo=SOMEORG/SOMEREPO&last=30`

#### Example response

```json
{
  "repo": "SOMEORG/SOMEREPO",
  "period": {
    "from": "1672963200",
    "to": "1673395199",
    "offset": 0
  },
  "total": {
    "changesCount": 3,
    "deploymentCount": 1,
    "incidentCount": 0
  },
  "metrics": {
    "changeFailureRate": "0.00",
    "deploymentFrequency": "0.20",
    "leadTimeForChanges": "00:00:04:04",
    "timeToRestoreServices": "00:00:00:00"
  }
}
```

### Get all metrics between two dates

#### Request

`GET {{BASE_URL}}/metrics?repo=SOMEORG/SOMEREPO&from=20230101&to=20230110`

#### Example response

```json
{
  "repo": "SOMEORG/SOMEREPO",
  "period": {
    "from": "1672531200",
    "to": "1673395199",
    "offset": 0
  },
  "total": {
    "changesCount": 3,
    "deploymentCount": 1,
    "incidentCount": 0
  },
  "metrics": {
    "changeFailureRate": "0.00",
    "deploymentFrequency": "0.10",
    "leadTimeForChanges": "00:00:04:04",
    "timeToRestoreServices": "00:00:00:00"
  }
}
```

### Get all metrics with a time zone offset

Note that this works precisely the same for `last` usage.

#### Request

`GET {{BASE_URL}}/metrics?repo=SOMEORG/SOMEREPO&from=20230101&to=20230110&offset=-5`

#### Example response

```json
{
  "repo": "SOMEORG/SOMEREPO",
  "period": {
    "from": "1672513200",
    "to": "1673377199",
    "offset": -5
  },
  "total": {
    "changesCount": 3,
    "deploymentCount": 1,
    "incidentCount": 0
  },
  "metrics": {
    "changeFailureRate": "0.00",
    "deploymentFrequency": "0.10",
    "leadTimeForChanges": "00:00:04:04",
    "timeToRestoreServices": "00:00:00:00"
  }
}
```

### Get last deployment ID

#### Request

`GET {{BASE_URL}}/lastdeployment?repo=SOMEORG/SOMEREPO`

#### Response

```json
{
  "id": "de9e97a5f7e60230c440c627b0779629fa2c796b",
  "timeCreated": "1644259334000"
}
```

---

## Ideas for improvements

- Create test data
- Add more tests
- Higher type coverage
- The time format `DD:HH:MM:SS` is logically limited to 99 days - but is this a real problem?
- Authorization when adding events?
- Alarms for failures

---

## References

### Articles

- [Are you an Elite DevOps performer? Find out with the Four Keys Project](https://cloud.google.com/blog/products/devops-sre/using-the-four-keys-to-measure-your-devops-performance)
- [DevOps culture: How to transform](https://cloud.google.com/architecture/devops/devops-culture-transform)
- [Implementing DORA key software delivery metrics](https://danlebrero.com/2021/11/10/implementing-dora-software-delivery-metrics-accelerate-performance/)

### Other solutions

- [Four Keys](https://github.com/GoogleCloudPlatform/fourkeys)
- [DevOps Metrics](https://github.com/samsmithnz/DevOpsMetrics)
- [DORAmeter](https://github.com/brigonzalez/DORAmeter)
