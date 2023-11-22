/*
 * Copyright OpenSearch Contributors
 * SPDX-License-Identifier: Apache-2.0
 */

import { ApiResponse } from '@opensearch-project/opensearch/.';
import { OpenSearchClient } from '../../../../../src/core/server';
import {
  IInput,
  IMessage,
  IOutput,
  ISession,
  ISessionFindResponse,
} from '../../../common/types/chat_saved_object_attributes';
import { GetSessionsSchema } from '../../routes/chat_routes';
import { StorageService } from './storage_service';
import { Interaction, MessageParser } from '../../types';
import { MessageParserRunner } from '../../utils/message_parser_runner';

export class AgentFrameworkStorageService implements StorageService {
  constructor(
    private readonly client: OpenSearchClient,
    private readonly messageParsers: MessageParser[] = []
  ) {}
  async getSession(sessionId: string): Promise<ISession> {
    const session = (await this.client.transport.request({
      method: 'GET',
      path: `/_plugins/_ml/memory/conversation/${sessionId}/_list`,
    })) as ApiResponse<{
      interactions: Interaction[];
    }>;
    const messageParserRunner = new MessageParserRunner(this.messageParsers);
    const allInteractions = session.body.interactions.filter((item) => !item.parent_interaction_id);
    let finalMessages: IMessage[] = [];
    for (const interaction of allInteractions) {
      finalMessages = [...finalMessages, ...(await messageParserRunner.run(interaction))];
    }
    return {
      title: 'test',
      version: 1,
      createdTimeMs: Date.now(),
      updatedTimeMs: Date.now(),
      messages: finalMessages,
    };
  }

  async getSessions(query: GetSessionsSchema): Promise<ISessionFindResponse> {
    throw new Error('Method not implemented.');
  }

  async saveMessages(
    title: string,
    sessionId: string | undefined,
    messages: IMessage[]
  ): Promise<{ sessionId: string; messages: IMessage[] }> {
    throw new Error('Method not implemented.');
  }
  deleteSession(sessionId: string): Promise<{}> {
    throw new Error('Method not implemented.');
  }
  updateSession(sessionId: string, title: string): Promise<{}> {
    throw new Error('Method not implemented.');
  }
}
