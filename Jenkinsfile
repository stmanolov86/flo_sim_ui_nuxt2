pipeline {
  agent { label "apollo-worker" }
  tools { nodejs "nodejs" }

  environment {
    GIT_TAG = "${sh(script: 'git describe --tags --always', returnStdout: true).trim()}"
    REPOSITORY = "harbor.flolive.net/testing/flo_sim_ui:${env.GIT_TAG}"
  }
  stages {
    stage('Build Image') {
      steps {
        sh "docker build --pull --no-cache --build-arg GIT_TAG=${env.GIT_TAG} -t ${env.REPOSITORY} ."
      }
    }
    stage('Upload Image') {
      steps {
        script {
          docker.withRegistry('https://harbor.flolive.net', 'harbor') {
            sh "docker push ${env.REPOSITORY}"
          }
        }
      }
    }
    stage('OWASP Analysis') {
      steps {
        sh "npm ci"
        
        dependencyCheck additionalArguments: '''
          -o "."
          -s "."
          -f "HTML"
          --disablePnpmAudit
          --disableAssembly
          --disableYarnAudit
          --disableRetireJS
          --prettyPrint''', odcInstallation: '7.1.2'

        dependencyCheckPublisher pattern: 'dependency-check-report.xml'
      }
    }
    stage('SonarQube Analysis') {
      agent {
        docker {
          label "apollo-worker"
          image 'sonarsource/sonar-scanner-cli:latest'
          alwaysPull true
        }
      }
      environment {
        SONAR_USER_HOME="${env.WORKSPACE}"
      }
      steps {
        sh "sonar-scanner" +
           " -Dsonar.host.url=http://flo-sonarq01.flolive.int" +
           " -Dsonar.token=d6b0625eb7d4667f018218190ee4cca3f40015a0" +
           " -Dsonar.branch.name=${env.BRANCH_NAME}" +
           " -Dsonar.sources=." +
           " -Dsonar.cpd.exclusions=/**" +
           " -Dsonar.coverage.exclusions=/**" +
           " -Dsonar.projectKey=flo-sim-ui" +
           " -Dsonar.projectName='flo-sim-ui'"
      }
    }
    stage('Clean Image') {
      steps {
        sh "docker rmi ${env.REPOSITORY}"
      }
    }
  }
  post {
    always {
      script {
        if (fileExists('dependency-check-report.html')) {
            archiveArtifacts artifacts: 'dependency-check-report.html', onlyIfSuccessful: true, fingerprint: true
        } else {
            echo 'dependency-check-report.html not found, skipping archiving.'
        }
      }
    }
  }
}
