#!/usr/bin/env bash

dockerfile='Dockerfile'
image_name='splitwizz:v7'

echo "Building $image_name"
docker build  -f "$dockerfile" -t "$image_name" .

if [[ $1 =~ ^(-p|--push) ]]
then
  registry="$DOCKER_HOME_REGISTRY"
  repository_name="$registry/$image_name"

  echo "Tagging image: $repository_name"
  docker tag "$image_name" "$repository_name"

  echo "Pushing image to registry: $repository_name"
  docker push "$repository_name"
fi

