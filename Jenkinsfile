pipeline {

    agent any
    
    stages {
        stage("Build Docker Image") {
            steps {
                sh 'sudo docker build -t localhost:5000/pcpartstool-price-scraper:latest .'
            }
        }

        stage("Push Image to Dockerhub") {
          steps {
            sh 'sudo docker push localhost:5000/pcpartstool-price-scraper:latest'
          }
        }
    }
    // remove old builds
    post {
      always {
        sh 'sudo docker system prune -f'
      }
    }
}