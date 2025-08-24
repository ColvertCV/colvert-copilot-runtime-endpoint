pipeline {
    agent any

    options {
        durabilityHint 'MAX_SURVIVABILITY'
    }

    environment {
        // Telegram configuration
        TOKEN = credentials('telegram-credentials')
        CHAT_ID = credentials('Telegram_ChatID')
        SERVICE_NAME = "colvert-copilot-runtime-endpoint"
        HARBOR_USER = credentials('harbor_jenkins_user')
        HARBOR_PASSWORD = credentials('harbor_jenkins_password')
        HARBOR_REPO = "harbor.colvert.ai/colvert/${SERVICE_NAME}"
        COLVERT_PYPI_USER = credentials('colvert_pypi_user')
        COLVERT_PYPI_PASSWORD = credentials('colvert_pypi_password')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }


        stage('Get Commit Hash') {
            steps {
                script {
                    env.IMAGE_TAG = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
                    env.VERSION = env.BUILD_NUMBER + "." + env.IMAGE_TAG
                    echo "VERSION: ${env.VERSION}"
                }
            }
        }

        stage('Build Docker Image and Push to Harbor') {
            agent {
                docker {
                    image 'docker:dind'
                    args '-v /var/run/docker.sock:/var/run/docker.sock'
                    alwaysPull true
                }
            }
            steps {
                script {
                    // Build the image once with one tag (you can choose either `latest` or a versioned tag as primary)
                    sh '''docker build -t $HARBOR_REPO:$VERSION --build-arg COLVERT_PYPI_USER=$COLVERT_PYPI_USER --build-arg COLVERT_PYPI_PASSWORD=$COLVERT_PYPI_PASSWORD .'''

                    // Add the second tag pointing to the same image (no rebuild)
                    sh '''docker tag $HARBOR_REPO:$VERSION $HARBOR_REPO:latest'''

                    // Login to Harbor
                    sh '''echo "$HARBOR_PASSWORD" | docker login -u "$HARBOR_USER" --password-stdin harbor.colvert.ai'''

                    // Push both tags (same image, two references)
                    sh '''docker push $HARBOR_REPO:$VERSION'''
                    sh '''docker push $HARBOR_REPO:latest'''

                    // Logout
                    sh '''docker logout harbor.colvert.ai'''
                }
            }
        }
    }

    post {
        success {
            script {
                sh "curl -X POST -H \"Content-Type: application/json\" -d \"{\\\"chat_id\\\":${CHAT_ID}, \\\"text\\\": \\\"Build Succeeded! (${env.VERSION}) (${SERVICE_NAME})\\\", \\\"disable_notification\\\": false}\" https://api.telegram.org/bot${TOKEN}/sendMessage"
            }
        }
        failure {
            script {
                sh "curl -X POST -H \"Content-Type: application/json\" -d \"{\\\"chat_id\\\":${CHAT_ID}, \\\"text\\\": \\\"Build failed! (${env.VERSION}) (${SERVICE_NAME})\\\", \\\"disable_notification\\\": false}\" https://api.telegram.org/bot${TOKEN}/sendMessage"
            }
            cleanWs()
        }
    }
}