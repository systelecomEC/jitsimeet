import { ReducerRegistry } from '../redux';

import { PARTICIPANT_JOINED } from '../participants';

import {
    TRACK_ADDED,
    TRACK_CHANGED,
    TRACK_REMOVED
} from './actionTypes';

/**
 * @typedef {Object} Track
 * @property {(JitsiLocalTrack|JitsiRemoteTrack)} jitsiTrack - JitsiTrack
 * instance.
 * @property {boolean} local=false - If track is local.
 * @property {MEDIA_TYPE} mediaType=false - Media type of track.
 * @property {boolean} mirrorVideo=false - If video track should be mirrored.
 * @property {boolean} muted=false - If track is muted.
 * @property {string|undefined} participantId - ID of participant whom this
 * track belongs to.
 * @property {boolean} videoStarted=false - If video track has already started
 * to play.
 * @property {(VIDEO_TYPE|undefined)} videoType - Type of video track if any.
 */

/**
 * Reducer function for a single track.
 *
 * @param {Track|undefined} state - Track to be modified.
 * @param {Object} action - Action object.
 * @param {string} action.type - Type of action.
 * @param {Track} action.track - Information about track to be changed.
 * @param {Participant} action.participant - Information about participant.
 * @returns {Track|undefined}
 */
function track(state, action) {
    switch (action.type) {
    /**
     * Local participant may join after local tracks has been created, so
     * need to sync his ID with participantID property of a Track
     */
    case PARTICIPANT_JOINED:
        if (state.local && action.participant.local) {
            return {
                ...state,
                participantId: action.participant.id
            };
        }
        return state;
    case TRACK_CHANGED:
        if (action.track.jitsiTrack === state.jitsiTrack) {
            return { ...state,  ...action.track };
        }
        return state;

    default:
        return state;
    }
}

/**
 * Listen for actions that mutate (e.g. add, remove) local and remote tracks.
 */
ReducerRegistry.register('features/base/tracks', (state = [], action) => {
    switch (action.type) {
    case TRACK_ADDED:
        return [...state, action.track];

    case PARTICIPANT_JOINED:
    case TRACK_CHANGED:
        return state.map(t => track(t, action));

    case TRACK_REMOVED:
        return state
            .filter(track => track.jitsiTrack !== action.track.jitsiTrack);

    default:
        return state;
    }
});
