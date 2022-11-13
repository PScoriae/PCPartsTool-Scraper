pipeline {

    agent any
    
    stages {
        stage("Build Docker Image") {
            steps {
                sh 'sudo docker build -t localhost:5000/pcpartstool-scraper:latest .'
            }
        }

        stage("Push Image to Local Registry") {
          steps {
            sh 'sudo docker push localhost:5000/pcpartstool-scraper:latest'
          }
        }
    }
    // remove old builds
    post {
      cleanup {
        sh 'sudo docker system prune -f'
      }
    }
}