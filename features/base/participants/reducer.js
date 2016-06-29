import { ReducerRegistry } from '../redux';

import {
    DOMINANT_SPEAKER_CHANGED,
    PARTICIPANT_ADDED,
    PARTICIPANT_FOCUSED,
    PARTICIPANT_PINNED,
    PARTICIPANT_REMOVED,
    PARTICIPANT_ROLE_CHANGED,
    PARTICIPANT_SELECTED,
    PARTICIPANT_UPDATED
} from './actionTypes';

/**
 * Participant object.
 * @typedef {Object} Participant
 * @property {string} id - participant ID.
 * @property {string} name - participant name.
 * @property {string} avatar - path to participant avatar if any.
 * @property {string} role - participant role.
 * @property {boolean} local - if true, participant is local.
 * @property {boolean} pinned - if true, participant is current
 *      "PINNED_ENDPOINT".
 * @property {boolean} speaking - if true, participant is currently a
 *      dominant speaker.
 * @property {boolean} focused - if true, participant is currently visually
 *      selected on UI.
 * @property {boolean} selected - if true, participant is current
 *      "SELECTED_ENDPOINT".
 * @property {boolean} videoStarted -  if true, participant video stream has
 *      already started.
 * @property {'camera'|'desktop'|undefined} videoType - type of participant's
 *      current video stream.
 */

/**
 * These properties should not be bulk assigned when updating a particular
 * @see Participant.
 * @type {string[]}
 */
const PARTICIPANT_PROPS_TO_OMIT_WHEN_UPDATE = [
    'id', 'local', 'pinned', 'speaking', 'focused'];

/**
* Actions for a single participant.
* @param {Participant|undefined} state
* @param {Object} action
* @param {string} action.type
* @param {Participant} action.participant
* @returns {Participant|undefined}
 */
function participant(state, action) {
    switch (action.type) {
    case PARTICIPANT_ADDED:
        return {
            id: action.participant.id,
            name: action.participant.name,
            avatar: action.participant.avatar,
            role: action.participant.role,
            local: action.participant.local || false,
            pinned: action.participant.pinned || false,
            speaking: action.participant.speaking || false,
            focused: action.participant.focused || false,
            selected: action.participant.selected || false,
            videoType: action.participant.videoType || undefined,
            videoStarted: false
        };
    case DOMINANT_SPEAKER_CHANGED:
        // Only one dominant speaker is allowed.
        return Object.assign({}, state, {
            speaking: state.id === action.participant.id
        });
    case PARTICIPANT_FOCUSED:
        // Currently only one focused participant is allowed.
        return Object.assign({}, state, {
            focused: state.id === action.participant.id
        });
    case PARTICIPANT_PINNED:
        // Currently only one pinned participant is allowed.
        return Object.assign({}, state, {
            pinned: state.id === action.participant.id
        });
    case PARTICIPANT_SELECTED:
        // Currently only one selected participant is allowed.
        return Object.assign({}, state, {
            selected: state.id === action.participant.id
        });
    case PARTICIPANT_UPDATED:
        if (state.id === action.participant.id) {
            let updateObj = {};

            for (let key in action.participant) {
                if (action.participant.hasOwnProperty(key) &&
                    PARTICIPANT_PROPS_TO_OMIT_WHEN_UPDATE.indexOf(key) === -1) {
                    updateObj[key] = action.participant[key];
                }
            }

            return Object.assign({}, state, updateObj);
        }

        return state;
    case PARTICIPANT_ROLE_CHANGED:
        // TODO: check how actually roles change!!
        return state;
    default:
        return state;
    }
}

/**
* Listen for actions which add, remove, or update the set of participants
* in the conference.
* @param {Participant[]} state
* @param {Object} action
* @param {string} action.type
* @param {Participant} action.participant
* @returns {Participant[]}
*/
ReducerRegistry.register('features/base/participants', (state = [], action) => {
    switch (action.type) {
    case PARTICIPANT_ADDED:
        return [ ...state, participant(undefined, action) ];
    case PARTICIPANT_REMOVED:
        return state.filter(p => p.id !== action.participant.id);
    case DOMINANT_SPEAKER_CHANGED:
    case PARTICIPANT_FOCUSED:
    case PARTICIPANT_PINNED:
    case PARTICIPANT_ROLE_CHANGED:
    case PARTICIPANT_SELECTED:
    case PARTICIPANT_UPDATED:
        return state.map(p => participant(p, action));
    default:
        return state;
    }
});
