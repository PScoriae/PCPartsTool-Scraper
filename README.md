<div align='center'>
<a href="https://jenkins.pierreccesario.com/job/PCPartsTool-Scraper/">
    <img src="https://jenkins.pierreccesario.com/buildStatus/icon?job=PCPartsTool-Scraper&style=flat-square">
</a>
<p>
  <a href="https://github.com/PScoriae/PCPartsTool-Scraper/blob/main/LICENSE.md">
        <img src="https://img.shields.io/badge/license-WTFPL-brightgreen?style=for-the-badge">
  </a>
  <a href="https://linkedin.com/in/pierreccesario">
    <img src="https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555">
  </a>
</p>
<p>
  <img src="./docs/favicon.svg" width=300>
</p>

## PCPartsTool Scraper

</div>
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
    </li>
    <li><a href="#installation">Installation</a></li>
  </ol>
</details>
<hr/>

# About

This project is the companion scraping tool to the PCPartsTool WebApp. It gathers the most popular PC hardware parts from Lazada.com.my and pushes said data to the PCPartsTool database.

**Note:** This is just one of multiple repositories that contribute to the PCPartsTool project. Here are all the related repositories:

| Repository                                                             | Built With                                                                                                                                                                                                                                                               | Description                                                         |
| ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------- |
| [PCPartsTool](https://github.com/PScoriae/PCPartsTool)                 | [SvelteKit](https://kit.svelte.com), [TypeScript](https://www.typescriptlang.org/), [Tailwind CSS](https://tailwindcss.com), [MongoDB](https://mongodb.com), [Jenkins](https://www.jenkins.io/), [Docker](https://www.docker.com/), [Playwright](https://playwright.dev) | The SvelteKit MongoDB WebApp                                        |
| [PCPartsTool-Scraper](https://github.com/PScoriae/PCPartsTool-Scraper) | [JavaScript](https://www.javascript.com/), [Jenkins](https://www.jenkins.io/), [Docker](https://www.docker.com/)                                                                                                                                                         | Scraping Script to Gather E-commerce Item Data                      |
| [terraform-infra](https://github.com/PScoriae/terraform-infra)         | [Terraform](https://terraform.com), [Cloudflare](https://cloudflare.com), [AWS](https://aws.amazon.com)                                                                                                                                                                  | Terraform IaC for PCPartsTool Cloud Infrastructure                  |
| [ansible-ec2](https://github.com/PScoriae/ansible-ec2)                 | [Ansible](https://ansible.com), [Prometheus](https://prometheus.io), [Grafana](https://grafana.com), [Nginx](https://nginx.com), [AWS](https://aws.amazon.com)                                                                                                           | Ansible CaC for AWS EC2 Bootstraping, Observability and Maintenance |

# Installation

This section guides you on how to setup the scraper for use in the context of the PCPartsTool project.

1. Fork the repository.
2. In your desired project folder, clone the project with the following command:

   ```bash
   git clone https://github.com/yourUsername/PCPartsTool-Scraper
   ```

3. Add a `.env` file to the root directory of your project. You may refer to `.env.example`. It's for the scraper to point to the desired database.
4. Ensure `pnpm` is installed globally on your dev system. If not, run the following command in your terminal:

   ```bash
   npm i -g pnpm
   ```

5. Finally, install all dependencies:
   ```bash
   pnpm i
   ```

# Deployment

## Locally

This is if you want to locally host this using the `docker-compose.local.yaml` file in [PCPartsTool](https://github.com/PScoriae/PCPartsTool).

1. Dockerize the project using the following command:
   ```bash
   docker build -t pcpartstool-scraper:latest .
   ```
2. Continue with the local deployment instructions in [PCPartsTool](https://github.com/PScoriae/PCPartsTool).

## Cloud

This assumes that you have followed the flow of the rest of the repositories in the PCPartsTool project.
Jenkins will Dockerize this project on each push to main and then store the image locally in the registry.
Then, it will get pulled by the main PCPartsTool Jenkins pipeline.

1. Setup a GitHub Webhook on your forked repository to point to your Jenkins instance.
2. Add a new Jenkins Pipeline job and point it to your forked repo with the following enabled:
   - Do not allow concurrent builds
   - GITScm polling
   - Pipeline Script from SCM
   - Repository URL should be whatever your forked repository's URL is
   - Branches to build: `*/main`
   - Additional Behaviours:
     - Polling ignores commits in certain paths: `README.md` in **Excluded regions**
