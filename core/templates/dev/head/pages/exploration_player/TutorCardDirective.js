// Copyright 2017 The Oppia Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/**
 * @fileoverview Controller for the Tutor Card.
 */

oppia.animation('.conversation-skin-responses-animate-slide', function() {
  return {
    removeClass: function(element, className, done) {
      if (className !== 'ng-hide') {
        done();
        return;
      }
      element.hide().slideDown(400, done);
    },
    addClass: function(element, className, done) {
      if (className !== 'ng-hide') {
        done();
        return;
      }
      element.slideUp(400, done);
    }
  };
});

oppia.directive('tutorCard', [
  'UrlInterpolationService', function(UrlInterpolationService) {
    return {
      restrict: 'E',
      scope: {
        onClickContinueButton: '&',
        onSubmitAnswer: '&',
        onDismiss: '&',
        startCardChangeAnimation: '=',
        onChangeInteractionAnswerValidity: '&'
      },
      templateUrl: UrlInterpolationService.getDirectiveTemplateUrl(
        '/pages/exploration_player/' +
        'tutor_card_directive.html'),
      controller: [
        '$scope', '$timeout', '$rootScope', '$anchorScroll',
        'ExplorationPlayerService', 'PlayerPositionService', 'UrlService',
        'PlayerTranscriptService', 'ExplorationPlayerStateService',
        'WindowDimensionsService', 'DeviceInfoService', 'AudioPlayerService',
        'AutogeneratedAudioPlayerService', 'AudioPreloaderService',
        'TWO_CARD_THRESHOLD_PX', 'CONTENT_FOCUS_LABEL_PREFIX',
        'CONTINUE_BUTTON_FOCUS_LABEL', 'EVENT_ACTIVE_CARD_CHANGED',
        'EVENT_NEW_CARD_AVAILABLE',
        function(
          $scope, $timeout, $rootScope, $anchorScroll,
          ExplorationPlayerService, PlayerPositionService, UrlService,
          PlayerTranscriptService, ExplorationPlayerStateService,
          WindowDimensionsService, DeviceInfoService, AudioPlayerService,
          AutogeneratedAudioPlayerService, AudioPreloaderService,
          TWO_CARD_THRESHOLD_PX, CONTENT_FOCUS_LABEL_PREFIX,
          CONTINUE_BUTTON_FOCUS_LABEL, EVENT_ACTIVE_CARD_CHANGED,
          EVENT_NEW_CARD_AVAILABLE) {
          var updateActiveCard = function() {
            var index = PlayerPositionService.getActiveCardIndex();
            if (index === null) {
              return;
            }

            $scope.arePreviousResponsesShown = false;
            $scope.activeCard = PlayerTranscriptService.getCard(index);
            $scope.interactionIsActive =
              PlayerTranscriptService.isLastCard(index);
            $scope.$on(EVENT_NEW_CARD_AVAILABLE, function(evt, data) {
              $scope.interactionIsActive = false;
            });
            $scope.isInteractionInline = (
              ExplorationPlayerStateService.isInteractionInline(
                $scope.activeCard.stateName));
            $scope.lastAnswer =
              PlayerTranscriptService.getLastAnswerOnActiveCard(index);
            $scope.interactionInstructions = (
              ExplorationPlayerStateService.getInteractionInstructions(
                $scope.activeCard.stateName));


            $scope.contentAudioTranslations = (
              ExplorationPlayerService.getStateContentAudioTranslations(
                $scope.activeCard.stateName));

            AudioPlayerService.stop();
            AudioPreloaderService.clearMostRecentlyRequestedAudioFilename();
            AutogeneratedAudioPlayerService.cancel();
          };

          $scope.arePreviousResponsesShown = false;

          $scope.waitingForOppiaFeedback = false;

          $scope.windowDimensionsService = WindowDimensionsService;

          $scope.isIframed = UrlService.isIframed();

          $scope.CONTINUE_BUTTON_FOCUS_LABEL = CONTINUE_BUTTON_FOCUS_LABEL;

          $scope.OPPIA_AVATAR_IMAGE_URL = (
            UrlInterpolationService.getStaticImageUrl(
              '/avatar/oppia_avatar_100px.svg'));

          $scope.profilePicture = UrlInterpolationService.getStaticImageUrl(
            '/avatar/user_blue_72px.png');

          ExplorationPlayerService.getUserProfileImage().then(function(result) {
            $scope.profilePicture = result;
          });

          $scope.getContentFocusLabel = function(index) {
            return CONTENT_FOCUS_LABEL_PREFIX + index;
          };

          $scope.toggleShowPreviousResponses = function() {
            $scope.arePreviousResponsesShown =
             !$scope.arePreviousResponsesShown;
          };

          $scope.isWindowNarrow = function() {
            return WindowDimensionsService.isWindowNarrow();
          };

          $scope.isViewportNarrow = function() {
            return WindowDimensionsService.getWidth() < TWO_CARD_THRESHOLD_PX;
          };

          $scope.submitAnswer = function(answer, interactionRulesService) {
            $scope.waitingForOppiaFeedback = true;
            $scope.onSubmitAnswer({
              answer: answer,
              rulesService: interactionRulesService
            });
          };

          $scope.setInteractionAnswerValidity = function(answerValidity) {
            $scope.onChangeInteractionAnswerValidity({
              answerValidity: answerValidity
            });
          };

          $scope.isContentAudioTranslationAvailable = function() {
            return ExplorationPlayerService.isContentAudioTranslationAvailable(
                $scope.activeCard.stateName);
          };

          $scope.isCurrentCardAtEndOfTranscript = function() {
            return PlayerTranscriptService.isLastCard(
              PlayerPositionService.getActiveCardIndex());
          };

          $scope.isOnTerminalCard = function() {
            return $scope.activeCard &&
              ExplorationPlayerStateService.isStateTerminal(
                $scope.activeCard.stateName);
          };

          $scope.getInputResponsePairId = function(index) {
            return 'input-response-pair-' + index;
          };

          $scope.$on(EVENT_ACTIVE_CARD_CHANGED, function() {
            updateActiveCard();
          });

          $scope.$on('oppiaFeedbackAvailable', function() {
            $scope.waitingForOppiaFeedback = false;

            // Auto scroll to the new feedback on mobile device.
            if (DeviceInfoService.isMobileDevice()) {
              var index = PlayerPositionService.getActiveCardIndex();
              var activeCard = PlayerTranscriptService.getCard(index);
              var latestFeedbackIndex = (
                activeCard.inputResponsePairs.length - 1);
              $anchorScroll($scope.getInputResponsePairId(latestFeedbackIndex));
            }
          });

          updateActiveCard();
        }
      ]
    };
  }]);
