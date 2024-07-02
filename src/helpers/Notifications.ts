import { Constants } from '../types/config/Constants.js';
import { config } from './Config.js';
import { log } from './Log.js';
import { doRequest } from './Requests.js';


export const notify = async (message: string): Promise<void> => {
    const { notificationWebhook } = config();
    log(message);
    if (notificationWebhook) {
        const payload = {
            'content': message,
            'username': 'sonarrTubeBot',
            'avatar_url': ' https://github.com/phyzical/sonarrtube/blob/main/logo.png',
            //  TODO: do we want to switch up for fancier notifications?
            // 'embeds': [
            // {
            //     'title': 'Embed Title',
            //     'description': 'This is an embed description.',
            //     'url': 'https://example.com',
            //     'color': 5814783,
            //     'footer': {
            //         'text': 'Embed Footer Text',
            //         'icon_url': 'https://example.com/footer_icon.png'
            //     },
            //     'thumbnail': {
            //         'url': 'https://example.com/thumbnail.png'
            //     },
            //     'image': {
            //         'url': 'https://example.com/image.png'
            //     },
            //     'author': {
            //         'name': 'Author Name',
            //         'url': 'https://example.com',
            //         'icon_url': 'https://example.com/author_icon.png'
            //     },
            //     'fields': [
            //         {
            //             'name': 'Field 1',
            //             'value': 'Value of field 1',
            //             'inline': false
            //         },
            //         {
            //             'name': 'Field 2',
            //             'value': 'Value of field 2',
            //             'inline': true
            //         }
            //     ]
            // }
            // ]
        };
        await doRequest(
            notificationWebhook,
            Constants.REQUESTS.POST,
            { 'Content-Type': 'application/json' },
            null,
            JSON.stringify(payload)
        );
    }
};