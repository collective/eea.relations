""" eea.relations viewlets
"""
from eea.themecentre.interfaces import IThemeTagging
from plone.app.layout.viewlets.common import ViewletBase
from zope.component import getMultiAdapter
from Products.CMFCore.utils import getToolByName
from eea.themecentre.themecentre import getTheme
from DateTime import DateTime
from zope.component._api import queryAdapter


class NextRelatedArticleViewlet(ViewletBase):
    """ Viewlet to show next available article
    """

    def available(self):
        """ Method that enables the viewlet only if we are on a
            view template
        """
        plone = getMultiAdapter((self.context, self.request),
                                name=u'plone_context_state')
        return plone.is_view_template()

    def get_related_article(self):
        """ Get related article
        """
        context = self.context
        catalog = getToolByName(context, 'portal_catalog')
        adapter = queryAdapter(context, IThemeTagging, default=None)
        if adapter is None:
            return []

        theme_ids = adapter.tags
        now = DateTime()
        query = {'review_state': 'published',
                 'sort_on': 'effective',
                 'sort_order': 'reverse',
                 'portal_type': 'Article',
                 'getThemes': theme_ids[0]
                 }
        date_range = {
            'query': (
                now - (18 * 30),
                now,
            ),
            'range': 'min:max',
        }

        query['effective'] = date_range
        res = catalog(query)
        return res[0] if res else []
